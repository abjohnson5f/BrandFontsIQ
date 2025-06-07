/**
 * Enhanced Company Identification Module with Intelligent Learning
 * 
 * Integrates the intelligent learning system to improve identification rates
 * especially for international domains and FTP subdomains
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import pLimit from 'p-limit';
import { checkLearnedPatterns, recordSuccessfulIdentification } from './learning-system';
import { learnFromBatch, preprocessDomainRelationships } from './intelligent-learning';
import { analyzeDomain } from './domain-intelligence';

// Load configuration
const configPath = path.join(__dirname, '../configuration.json');
let config: any;

try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (error) {
  console.error('Failed to load configuration:', error);
  config = {
    companyIdentification: {
      parentSubsidiaryMap: {},
      urlPatterns: {}
    }
  };
}

// Validate configuration
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
  modelName?: string;
  useIntelligentLearning?: boolean;
}

// Cache for company lookups
const companyCache = new Map<string, CompanyIdentificationResult>();

// Initialize OpenAI
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }
  return openai;
}

// Retry utility
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

// Timeout wrapper
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

// Optimal concurrency
function getOptimalConcurrency(rows: number): number {
  const maxConcurrency = 6;
  
  if (rows < 500) return Math.min(5, maxConcurrency);
  if (rows < 2000) return Math.min(20, maxConcurrency);
  if (rows < 5000) return Math.min(50, maxConcurrency);
  return maxConcurrency;
}

function getCacheKey(data: CompanyData): string {
  return `${data.websiteAppTitle}|${data.url}|${data.url2 || ''}|${data.appUrl}`.toLowerCase();
}

// Enhanced pattern checking that handles FTP and international domains
function checkUrlPatternsEnhanced(url: string): { company: string; parentCompany?: string; confidence: number } | null {
  if (!url) return null;
  
  // Analyze the domain for intelligent pattern matching
  const domainInfo = analyzeDomain(url);
  
  // First check learned patterns (includes FTP and international)
  const learnedMatch = checkLearnedPatterns(url);
  if (learnedMatch) {
    return {
      company: learnedMatch.company,
      parentCompany: learnedMatch.parentCompany,
      confidence: learnedMatch.confidence
    };
  }
  
  // If it's an international domain, check the canonical form
  if (domainInfo.isInternational && domainInfo.canonicalForm) {
    const canonicalMatch = checkLearnedPatterns(domainInfo.canonicalForm);
    if (canonicalMatch) {
      return {
        company: canonicalMatch.company,
        parentCompany: canonicalMatch.parentCompany,
        confidence: canonicalMatch.confidence * 0.9 // Slightly lower confidence for inferred match
      };
    }
  }
  
  // Check config patterns
  const normalizedUrl = url.toLowerCase()
    .replace(/^(https?|ftp):\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
  
  for (const [pattern, company] of Object.entries(config.companyIdentification.urlPatterns)) {
    if (normalizedUrl.includes(pattern.toLowerCase())) {
      return {
        company: company as string,
        parentCompany: config.companyIdentification.parentSubsidiaryMap[company as string],
        confidence: 0.9
      };
    }
  }
  
  return null;
}

// Enhanced batch LLM calls
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
        30000
      ),
      3,
      1000
    );

    let parsed: any;
    try {
      parsed = JSON.parse(response.choices[0].message.content || '{"results":[]}');
    } catch (parseError) {
      console.error('Failed to parse LLM response:', parseError);
      throw new Error('Invalid JSON response from LLM');
    }
    
    const results = parsed.results || [];
    
    // Verify count
    if (results.length !== dataArray.length) {
      console.error(`LLM returned ${results.length} results but expected ${dataArray.length}`);
      while (results.length < dataArray.length) {
        results.push({
          company: 'Unknown',
          confidence: 0,
          reasoning: 'Missing from LLM response'
        });
      }
    }
    
    // Map results
    const mappedResults = dataArray.map((data, idx) => {
      const result = results[idx];
      if (!result) {
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

// Single company identification
async function identifyCompanySingle(data: CompanyData): Promise<CompanyIdentificationResult> {
  const cacheKey = getCacheKey(data);
  if (companyCache.has(cacheKey)) {
    return companyCache.get(cacheKey)!;
  }

  // Try enhanced pattern matching
  const urlMatch = checkUrlPatternsEnhanced(data.url);
  if (urlMatch && urlMatch.confidence >= 0.8) {
    const result = {
      company: urlMatch.company,
      parentCompany: urlMatch.parentCompany,
      confidence: urlMatch.confidence,
      reasoning: 'Matched URL pattern',
    };
    companyCache.set(cacheKey, result);
    recordSuccessfulIdentification(data.url, urlMatch.company, result.parentCompany, urlMatch.confidence);
    return result;
  }

  // Check app URL
  if (data.appUrl) {
    const appMatch = checkUrlPatternsEnhanced(data.appUrl);
    if (appMatch && appMatch.confidence >= 0.8) {
      const result = {
        company: appMatch.company,
        parentCompany: appMatch.parentCompany,
        confidence: appMatch.confidence,
        reasoning: 'Matched app URL pattern',
      };
      companyCache.set(cacheKey, result);
      return result;
    }
  }

  // Try URL2
  if (data.url2) {
    const url2Match = checkUrlPatternsEnhanced(data.url2);
    if (url2Match && url2Match.confidence >= 0.8) {
      const result = {
        company: url2Match.company,
        parentCompany: url2Match.parentCompany,
        confidence: url2Match.confidence,
        reasoning: 'Matched secondary URL',
      };
      companyCache.set(cacheKey, result);
      return result;
    }
  }

  // Needs LLM
  return {
    company: '__NEEDS_LLM__',
    confidence: 0,
    reasoning: 'Requires LLM identification'
  };
}

// Main identification function with intelligent learning
export async function identifyCompanies(
  dataArray: CompanyData[], 
  options: ProcessingOptions = {}
): Promise<CompanyIdentificationResult[]> {
  const {
    concurrency = getOptimalConcurrency(dataArray.length),
    batchSize = 10,
    onProgress,
    modelName = 'gpt-4-turbo-preview',
    useIntelligentLearning = true
  } = options;

  console.log(`Starting company identification for ${dataArray.length} items...`);
  console.log(`Intelligent learning: ${useIntelligentLearning ? 'ENABLED' : 'DISABLED'}`);

  // Phase 0: Preprocess domain relationships if intelligent learning is enabled
  if (useIntelligentLearning) {
    const relationships = preprocessDomainRelationships(dataArray);
    console.log(`Found ${relationships.size} domain relationship groups`);
  }

  const results: CompanyIdentificationResult[] = new Array(dataArray.length);
  const needsLLM: { index: number; data: CompanyData }[] = [];
  
  // Phase 1: Check cache and patterns
  console.log('Phase 1: Checking cache and patterns...');
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

  console.log(`Phase 1 complete: ${dataArray.length - needsLLM.length} identified, ${needsLLM.length} need LLM`);

  // Phase 2: Batch LLM calls
  if (needsLLM.length > 0) {
    console.log(`Phase 2: Processing ${needsLLM.length} items with LLM...`);
    const limit = pLimit(concurrency);
    const batches: { index: number; data: CompanyData }[][] = [];
    
    // Create batches
    for (let i = 0; i < needsLLM.length; i += batchSize) {
      batches.push(needsLLM.slice(i, i + batchSize));
    }
    
    // Process batches
    const batchPromises = batches.map((batch, batchIndex) => 
      limit(async () => {
        const batchData = batch.map(item => item.data);
        const batchResults = await identifyWithLLMBatch(batchData, modelName);
        
        if (batchResults.length !== batch.length) {
          throw new Error(`Batch size mismatch: expected ${batch.length}, got ${batchResults.length}`);
        }
        
        // Store results
        batch.forEach((item, idx) => {
          const result = batchResults[idx];
          if (!result) {
            throw new Error(`Missing result for batch item ${idx} (global index ${item.index})`);
          }
          results[item.index] = result;
          companyCache.set(getCacheKey(item.data), result);
          
          // Learn from successful identifications
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
        
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      })
    );
    
    await Promise.allSettled(batchPromises);
  }

  // Phase 3: Intelligent learning post-processing
  if (useIntelligentLearning) {
    console.log('Phase 3: Applying intelligent learning...');
    
    // Learn from the batch results
    learnFromBatch(dataArray, results);
    
    // Second pass: try to improve Unknown results
    let improvedCount = 0;
    results.forEach((result, index) => {
      if (result.company === 'Unknown') {
        // Check if we've learned anything that could help
        const enhancedMatch = checkUrlPatternsEnhanced(dataArray[index].url);
        if (enhancedMatch && enhancedMatch.confidence >= 0.7) {
          results[index] = {
            company: enhancedMatch.company,
            parentCompany: enhancedMatch.parentCompany,
            confidence: enhancedMatch.confidence,
            reasoning: 'Identified via intelligent pattern learning'
          };
          improvedCount++;
          
          // Update cache
          companyCache.set(getCacheKey(dataArray[index]), results[index]);
        }
      }
    });
    
    if (improvedCount > 0) {
      console.log(`Intelligent learning improved ${improvedCount} identifications`);
    }
  }
  
  // Calculate final stats
  const unknownCount = results.filter(r => r.company === 'Unknown').length;
  const successRate = ((dataArray.length - unknownCount) / dataArray.length * 100).toFixed(1);
  console.log(`\nIdentification complete: ${successRate}% success rate (${unknownCount} unknown)`);
  
  return results;
}

// Backward compatibility
export async function identifyCompany(data: CompanyData): Promise<CompanyIdentificationResult> {
  const results = await identifyCompanies([data], { concurrency: 1, batchSize: 1 });
  return results[0];
}

export function getCacheStats(): { size: number; hitRate: number } {
  return {
    size: companyCache.size,
    hitRate: 0,
  };
}

export function clearCache(): void {
  companyCache.clear();
}