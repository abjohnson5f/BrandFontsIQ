import OpenAI from 'openai';

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

// Cache for company lookups to avoid redundant API calls
const companyCache = new Map<string, CompanyIdentificationResult>();

// Known parent-subsidiary relationships
const parentSubsidiaryMap: Record<string, string> = {
  'Indian Motorcycle': 'Polaris Inc',
  'Victory Motorcycles': 'Polaris Inc',
  'Ranger': 'Polaris Inc',
  'RZR': 'Polaris Inc',
  'Sportsman': 'Polaris Inc',
  'General': 'Polaris Inc',
  'Slingshot': 'Polaris Inc',
  'Timbersled': 'Polaris Inc',
  'Taylor-Dunn': 'Polaris Inc',
  'GEM': 'Polaris Inc',
  'Aixam': 'Aixam Group',
  'Mega': 'Aixam Group',
};

// Pattern matching for common cases
const urlPatterns: Record<string, string> = {
  'polaris.com': 'Polaris Inc',
  'indianmotorcycle.com': 'Indian Motorcycle',
  'rzr.com': 'RZR',
  'ranger.com': 'Ranger',
  'aixam.com': 'Aixam',
  'mega-automobiles.fr': 'Mega',
};

/**
 * Generate a cache key from company data
 */
function getCacheKey(data: CompanyData): string {
  return `${data.websiteAppTitle}|${data.url}|${data.url2 || ''}|${data.appUrl}`.toLowerCase();
}

/**
 * Try to identify company from URL patterns
 */
function identifyFromPatterns(data: CompanyData): CompanyIdentificationResult | null {
  // Check direct URL matches
  const url = data.url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
  
  for (const [pattern, company] of Object.entries(urlPatterns)) {
    if (url.includes(pattern)) {
      return {
        company,
        parentCompany: parentSubsidiaryMap[company],
        confidence: 0.9,
        reasoning: 'Matched URL pattern'
      };
    }
  }

  // Check app URL patterns
  if (data.appUrl) {
    const appUrl = data.appUrl.toLowerCase();
    // Check for specific subsidiaries first
    if (appUrl.includes('indianmotorcycle')) {
      return {
        company: 'Indian Motorcycle',
        parentCompany: 'Polaris Inc',
        confidence: 0.9,
        reasoning: 'App URL matches subsidiary'
      };
    }
    // Then check for parent company
    if (appUrl.includes('polaris')) {
      const company = 'Polaris Inc';
      return {
        company,
        confidence: 0.85,
        reasoning: 'App URL contains company name'
      };
    }
  }

  return null;
}

/**
 * Use OpenAI to identify company from the provided data
 */
async function identifyWithLLM(data: CompanyData): Promise<CompanyIdentificationResult> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const prompt = `Analyze the following website/app data and identify the company behind it. This may be a dealer, distributor, or subsidiary website.

Website/App Title: ${data.websiteAppTitle || 'Not provided'}
URL: ${data.url || 'Not provided'}
URL 2: ${data.url2 || 'Not provided'}
App URL: ${data.appUrl || 'Not provided'}

Based on this information:
1. Identify the primary company (not the dealer or distributor)
2. If this is a subsidiary, identify the parent company
3. Provide confidence level (0-1)
4. Explain your reasoning

For example, if the website title is "ABB VSP VOITURES SANS PERMIS THIONVILLE • MOSELLE (57)" and URL is "abb-vsp.com", this is likely a dealer for Aixam (which manufactures "voitures sans permis" - cars without license).

Respond in JSON format:
{
  "company": "Company Name",
  "parentCompany": "Parent Company Name or null",
  "confidence": 0.85,
  "reasoning": "Brief explanation"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at identifying companies from website and app data. You understand dealer networks, subsidiaries, and can identify the actual manufacturer or brand even from dealer websites.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      company: result.company || 'Unknown',
      parentCompany: result.parentCompany || undefined,
      confidence: result.confidence || 0.5,
      reasoning: result.reasoning || 'LLM analysis'
    };
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return {
      company: 'Unknown',
      confidence: 0,
      reasoning: 'Error in LLM analysis'
    };
  }
}

/**
 * Main function to identify company using multi-strategy approach
 */
export async function identifyCompany(data: CompanyData): Promise<CompanyIdentificationResult> {
  // Check cache first
  const cacheKey = getCacheKey(data);
  if (companyCache.has(cacheKey)) {
    return companyCache.get(cacheKey)!;
  }

  // Skip empty entries
  if (!data.websiteAppTitle && !data.url && !data.appUrl) {
    const result = {
      company: 'Unknown',
      confidence: 0,
      reasoning: 'No data provided'
    };
    companyCache.set(cacheKey, result);
    return result;
  }

  // Try pattern matching first (faster and more reliable for known cases)
  const patternResult = identifyFromPatterns(data);
  if (patternResult && patternResult.confidence >= 0.85) {
    companyCache.set(cacheKey, patternResult);
    return patternResult;
  }

  // Use LLM for complex cases
  const llmResult = await identifyWithLLM(data);
  
  // If we had a pattern match with lower confidence, compare
  if (patternResult && patternResult.confidence > llmResult.confidence) {
    companyCache.set(cacheKey, patternResult);
    return patternResult;
  }

  companyCache.set(cacheKey, llmResult);
  return llmResult;
}

/**
 * Batch process multiple company identifications
 */
export async function identifyCompanies(
  dataArray: CompanyData[],
  onProgress?: (current: number, total: number) => void
): Promise<CompanyIdentificationResult[]> {
  const results: CompanyIdentificationResult[] = [];
  
  for (let i = 0; i < dataArray.length; i++) {
    if (onProgress) {
      onProgress(i + 1, dataArray.length);
    }
    
    const result = await identifyCompany(dataArray[i]);
    results.push(result);
    
    // Small delay to avoid rate limiting
    if (i > 0 && i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}