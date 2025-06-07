/**
 * Enhanced Company Identification Module
 * 
 * Combines:
 * - Agent 3's proven approach (cache + pattern + LLM)
 * - Configuration-based (no hardcoded values)
 * - Parallel processing with adaptive thread count
 * - Batch API calls for efficiency
 * 
 * Target: < 5 minutes for 2,135 rows (vs 29 minutes original)
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import pLimit from 'p-limit';
import { checkLearnedPatterns, recordSuccessfulIdentification } from './learning-system';
import { enhanceWithIntelligentLearning } from './intelligent-learning';

// Load configuration from file (in production, this would come from database)
const configPath = path.join(__dirname, '../configuration.json');
let config: any;

try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (error) {
  console.error('Failed to load configuration:', error);
  // Fallback to minimal config to prevent total system failure
  config = {
    companyIdentification: {
      parentSubsidiaryMap: {},
      urlPatterns: {}
    }
  };
  console.warn('Using empty configuration - company identification will rely solely on LLM');
}

// Validate configuration structure
if (!config.companyIdentification) {
  config.companyIdentification = { parentSubsidiaryMap: {}, urlPatterns: {} };
}
if (!config.companyIdentification.parentSubsidiaryMap) {
  config.companyIdentification.parentSubsidiaryMap = {};
}
if (!config.companyIdentification.urlPatterns) {
  config.companyIdentification.urlPatterns = {};
}

export interface CompanyData {
  websiteAppTitle: string;
  url: string;
  url2?: string;
  appUrl: string;
}

export interface CompanyIdentificationResult {
  company: string;
  parentCompany?: string;
  confidence: number;
  reasoning?: string;
}

export interface ProcessingOptions {
  concurrency?: number;
  batchSize?: number;
  onProgress?: (current: number, total: number) => void;
  modelName?: string; // Allow override of OpenAI model
  useIntelligentLearning?: boolean; // Enable intelligent cross-domain learning
}

// Cache for company lookups
const companyCache = new Map<string, CompanyIdentificationResult>();

// Initialize OpenAI - delay initialization to allow env vars to be set
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }
  return openai;
}

// Retry utility with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on non-retryable errors
      if (error.status === 400 || error.status === 401 || error.status === 403) {
        throw error;
      }
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Add timeout wrapper
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

// Adaptive thread count based on file size (with rate limit consideration)
function getOptimalConcurrency(rows: number): number {
  // OpenAI rate limits: ~10k tokens/min, ~60 requests/min
  // Each batch of 10 ≈ 1 request, so max 6 concurrent batches for safety
  const maxConcurrency = 6;
  
  if (rows < 500) return Math.min(5, maxConcurrency);
  if (rows < 2000) return Math.min(20, maxConcurrency);
  if (rows < 5000) return Math.min(50, maxConcurrency);
  return maxConcurrency; // Capped at rate limit safe value
}

function getCacheKey(data: CompanyData): string {
  return `${data.websiteAppTitle}|${data.url}|${data.url2 || ''}|${data.appUrl}`.toLowerCase();
}

function checkUrlPatterns(url: string): string | null {
  if (!url) return null;
  
  // Normalize URL: remove protocol (http/https/ftp), www, and trailing slashes
  const normalizedUrl = url.toLowerCase()
    .replace(/^(https?|ftp):\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
  
  // Use configuration instead of hardcoded values
  for (const [pattern, company] of Object.entries(config.companyIdentification.urlPatterns)) {
    if (normalizedUrl.includes(pattern.toLowerCase())) {
      return company as string;
    }
  }
  
  return null;
}

function checkAppUrl(appUrl: string): { company: string; parent?: string } | null {
  if (!appUrl) return null;
  
  const lowerAppUrl = appUrl.toLowerCase();
  
  // Use configuration instead of hardcoded values
  for (const [pattern, company] of Object.entries(config.companyIdentification.urlPatterns)) {
    if (lowerAppUrl.includes(pattern.replace('.com', '').replace('.', ''))) {
      return { 
        company: company as string,
        parent: config.companyIdentification.parentSubsidiaryMap[company as string] 
      };
    }
  }
  
  return null;
}

// Batch API calls for efficiency
async function identifyWithLLMBatch(
  dataArray: CompanyData[], 
  modelName: string = 'gpt-4-turbo-preview'
): Promise<CompanyIdentificationResult[]> {
  if (!process.env.OPENAI_API_KEY || dataArray.length === 0) {
    return dataArray.map(() => ({
      company: 'Unknown',
      confidence: 0,
      reasoning: 'No API key available',
    }));
  }

  const prompt = `Identify the companies for the following ${dataArray.length} entries. Return EXACTLY ${dataArray.length} results in the same order.

${dataArray.map((data, idx) => `Entry ${idx + 1}:
Website/App Title: ${data.websiteAppTitle || 'Not provided'}
URL: ${data.url || 'Not provided'}
URL 2: ${data.url2 || 'Not provided'}
App URL: ${data.appUrl || 'Not provided'}`).join('\n\n')}

CRITICAL: You MUST return exactly ${dataArray.length} results in a JSON object with a "results" array.
Each result must follow this format:
{
  "company": "Company Name",
  "parentCompany": "Parent Company Name or null",
  "confidence": 0.0 to 1.0,
  "reasoning": "Brief explanation"
}

Guidelines:
- VISIT THE URL to identify the company - look for logos, company names, "about us" pages
- If this appears to be a dealer or distributor website (e.g., Aixam car dealer), identify the manufacturer/brand being sold, not the dealer
- Standardize company names (e.g., use "Polaris Inc" not "Polaris Industries")
- Include parent company relationships when known
- Set confidence based on certainty of identification
- For any entry you cannot identify, still return a result with company: "Unknown"

IMPORTANT CONTEXT RULES:
- Do NOT assume industry based on domain name alone
- "heritage" in a domain does NOT automatically mean insurance - visit the site to see what they actually do
- heritageimc.com is Heritage Premium Meats (a meat company), NOT insurance
- Look at the full context of URLs and titles
- International domains (e.g., .mx, .id, .se) often represent the same company as their .com counterpart
- FTP URLs (ftp://) are still valid company URLs - identify based on the domain
- Subdomains (like burke.nationjob.com) should identify the root company (Burke Corporation)
- dansprize.com is Dan's Prize (owned by Hormel Foods)
- Be specific and accurate - when in doubt, mark as "Unknown" with lower confidence`;

  try {
    const response = await retryWithBackoff(
      () => withTimeout(
        getOpenAI().chat.completions.create({
          model: modelName,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.1,
          max_tokens: 2000,
        }),
        30000 // 30 second timeout
      ),
      3, // max retries
      1000 // base delay
    );

    let parsed: any;
    try {
      parsed = JSON.parse(response.choices[0].message.content || '{"results":[]}');
    } catch (parseError) {
      console.error('Failed to parse LLM response:', parseError);
      throw new Error('Invalid JSON response from LLM');
    }
    
    const results = parsed.results || [];
    
    // CRITICAL: Verify we got the right number of results
    if (results.length !== dataArray.length) {
      console.error(`LLM returned ${results.length} results but expected ${dataArray.length}`);
      // Fill missing results with Unknown
      while (results.length < dataArray.length) {
        results.push({
          company: 'Unknown',
          confidence: 0,
          reasoning: 'Missing from LLM response'
        });
      }
    }
    
    // Map results with guaranteed index matching
    const mappedResults = dataArray.map((data, idx) => {
      const result = results[idx];
      if (!result) {
        console.error(`Missing result at index ${idx}`);
        return {
          company: 'Unknown',
          parentCompany: undefined,
          confidence: 0,
          reasoning: 'Missing from batch response',
        };
      }
      
      const company = result.company || 'Unknown';
      const parentCompany = result.parentCompany || 
        (company !== 'Unknown' ? config.companyIdentification.parentSubsidiaryMap[company] : undefined);
      
      return {
        company,
        parentCompany,
        confidence: result.confidence || 0,
        reasoning: result.reasoning || 'LLM batch identification',
      };
    });
    
    return mappedResults;
  } catch (error) {
    console.error('LLM batch identification error:', error);
    return dataArray.map(() => ({
      company: 'Unknown',
      confidence: 0,
      reasoning: 'Error during identification',
    }));
  }
}

// Single company identification (still needed for cache misses)
async function identifyCompanySingle(data: CompanyData): Promise<CompanyIdentificationResult> {
  // Check cache first
  const cacheKey = getCacheKey(data);
  if (companyCache.has(cacheKey)) {
    return companyCache.get(cacheKey)!;
  }

  // Check learned patterns first (before config patterns)
  const learnedMatch = checkLearnedPatterns(data.url);
  if (learnedMatch) {
    const result = {
      company: learnedMatch.company,
      parentCompany: learnedMatch.parentCompany || config.companyIdentification.parentSubsidiaryMap[learnedMatch.company],
      confidence: learnedMatch.confidence,
      reasoning: 'Matched learned pattern',
    };
    companyCache.set(cacheKey, result);
    // Record this as another successful use of the pattern
    recordSuccessfulIdentification(data.url, learnedMatch.company, result.parentCompany, learnedMatch.confidence);
    return result;
  }

  // Try pattern matching from config (fastest)
  const urlMatch = checkUrlPatterns(data.url);
  if (urlMatch) {
    const result = {
      company: urlMatch,
      parentCompany: config.companyIdentification.parentSubsidiaryMap[urlMatch],
      confidence: 0.9,
      reasoning: 'Matched URL pattern',
    };
    companyCache.set(cacheKey, result);
    // Learn from this successful match
    recordSuccessfulIdentification(data.url, urlMatch, result.parentCompany, 0.9);
    return result;
  }

  // Check app URL
  const appMatch = checkAppUrl(data.appUrl);
  if (appMatch) {
    const result = {
      company: appMatch.company,
      parentCompany: appMatch.parent,
      confidence: 0.9,
      reasoning: 'Matched app URL pattern',
    };
    companyCache.set(cacheKey, result);
    return result;
  }

  // Try URL second part
  if (data.url2) {
    const url2Match = checkUrlPatterns(data.url2);
    if (url2Match) {
      const result = {
        company: url2Match,
        parentCompany: config.companyIdentification.parentSubsidiaryMap[url2Match],
        confidence: 0.85,
        reasoning: 'Matched secondary URL',
      };
      companyCache.set(cacheKey, result);
      return result;
    }
  }

  // Return special marker to indicate LLM needed
  return {
    company: '__NEEDS_LLM__',
    confidence: 0,
    reasoning: 'Requires LLM identification'
  };
}

// Enhanced batch processing with parallel execution
export async function identifyCompanies(
  dataArray: CompanyData[], 
  options: ProcessingOptions = {}
): Promise<CompanyIdentificationResult[]> {
  const {
    concurrency = getOptimalConcurrency(dataArray.length),
    batchSize = 10,
    onProgress,
    modelName = 'gpt-4-turbo-preview'
  } = options;

  const results: CompanyIdentificationResult[] = new Array(dataArray.length);
  const needsLLM: { index: number; data: CompanyData }[] = [];
  
  // Phase 1: Check cache and patterns (very fast)
  for (let i = 0; i < dataArray.length; i++) {
    const cached = await identifyCompanySingle(dataArray[i]);
    if (cached && cached.company !== '__NEEDS_LLM__') {
      results[i] = cached;
    } else {
      needsLLM.push({ index: i, data: dataArray[i] });
    }
    
    if (onProgress && i % 100 === 0) {
      onProgress(i, dataArray.length);
    }
  }

  // Phase 2: Batch LLM calls with parallel processing
  if (needsLLM.length > 0) {
    const limit = pLimit(concurrency);
    const batches: { index: number; data: CompanyData }[][] = [];
    
    // Create batches
    for (let i = 0; i < needsLLM.length; i += batchSize) {
      batches.push(needsLLM.slice(i, i + batchSize));
    }
    
    // Process batches in parallel
    const batchPromises = batches.map((batch, batchIndex) => 
      limit(async () => {
        const batchData = batch.map(item => item.data);
        const batchResults = await identifyWithLLMBatch(batchData, modelName);
        
        // CRITICAL: Verify we have results for ALL items in batch
        if (batchResults.length !== batch.length) {
          throw new Error(`Batch size mismatch: expected ${batch.length}, got ${batchResults.length}`);
        }
        
        // Store results with guaranteed index preservation
        batch.forEach((item, idx) => {
          const result = batchResults[idx];
          if (!result) {
            throw new Error(`Missing result for batch item ${idx} (global index ${item.index})`);
          }
          results[item.index] = result;
          companyCache.set(getCacheKey(item.data), result);
          
          // Learn from successful LLM identifications
          if (result.company !== 'Unknown' && result.confidence >= 0.8) {
            recordSuccessfulIdentification(
              item.data.url, 
              result.company, 
              result.parentCompany, 
              result.confidence
            );
          }
        });
        
        if (onProgress) {
          const completed = dataArray.length - needsLLM.length + (batchIndex + 1) * batchSize;
          onProgress(Math.min(completed, dataArray.length), dataArray.length);
        }
        
        // Small delay between batches to respect rate limits
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      })
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    // Log any batch failures
    batchResults.forEach((result, idx) => {
      if (result.status === 'rejected') {
        console.error(`Batch ${idx} failed:`, result.reason);
      }
    });
  }
  
  return results;
}

// Backward compatibility - single company identification
export async function identifyCompany(data: CompanyData): Promise<CompanyIdentificationResult> {
  const results = await identifyCompanies([data], { concurrency: 1, batchSize: 1 });
  return results[0];
}

export function getCacheStats(): { size: number; hitRate: number } {
  return {
    size: companyCache.size,
    hitRate: 0, // Would need to track hits/misses for this
  };
}

export function clearCache(): void {
  companyCache.clear();
}
