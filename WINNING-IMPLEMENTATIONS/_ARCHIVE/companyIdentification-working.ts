import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// Load configuration from file (in production, this would come from database)
const configPath = path.join(__dirname, '../configuration.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

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

function getCacheKey(data: CompanyData): string {
  return `${data.websiteAppTitle}|${data.url}|${data.url2 || ''}|${data.appUrl}`.toLowerCase();
}

function checkUrlPatterns(url: string): string | null {
  if (!url) return null;
  
  const normalizedUrl = url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
  
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

async function identifyWithLLM(data: CompanyData): Promise<CompanyIdentificationResult> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      company: 'Unknown',
      confidence: 0,
      reasoning: 'No API key available',
    };
  }

  const prompt = `Given the following information, identify the company and its parent company if applicable:

Website/App Title: ${data.websiteAppTitle || 'Not provided'}
URL: ${data.url || 'Not provided'}
URL 2: ${data.url2 || 'Not provided'}
App URL: ${data.appUrl || 'Not provided'}

Respond in JSON format:
{
  "company": "Company Name",
  "parentCompany": "Parent Company Name or null",
  "confidence": 0.0 to 1.0,
  "reasoning": "Brief explanation"
}

Guidelines:
- If this appears to be a dealer or distributor website, identify the manufacturer/brand being sold
- Standardize company names (e.g., use "Polaris Inc" not "Polaris Industries")
- Include parent company relationships when known
- Set confidence based on certainty of identification`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      company: result.company || 'Unknown',
      parentCompany: result.parentCompany || config.companyIdentification.parentSubsidiaryMap[result.company],
      confidence: result.confidence || 0,
      reasoning: result.reasoning || 'LLM identification',
    };
  } catch (error) {
    console.error('LLM identification error:', error);
    return {
      company: 'Unknown',
      confidence: 0,
      reasoning: 'Error during identification',
    };
  }
}

export async function identifyCompany(data: CompanyData): Promise<CompanyIdentificationResult> {
  // Check cache first
  const cacheKey = getCacheKey(data);
  if (companyCache.has(cacheKey)) {
    return companyCache.get(cacheKey)!;
  }

  // Try pattern matching first (fastest)
  const urlMatch = checkUrlPatterns(data.url);
  if (urlMatch) {
    const result = {
      company: urlMatch,
      parentCompany: config.companyIdentification.parentSubsidiaryMap[urlMatch],
      confidence: 0.9,
      reasoning: 'Matched URL pattern',
    };
    companyCache.set(cacheKey, result);
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

  // Fall back to LLM
  const llmResult = await identifyWithLLM(data);
  companyCache.set(cacheKey, llmResult);
  return llmResult;
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
