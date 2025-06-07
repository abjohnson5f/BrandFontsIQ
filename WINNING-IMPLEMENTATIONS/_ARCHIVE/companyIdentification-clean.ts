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

export interface CompanyIdentificationConfig {
  parentSubsidiaryMap: Record<string, string>;
  urlPatterns: Record<string, string>;
  openAIApiKey: string;
  modelName?: string;
  maxRetries?: number;
}

// Cache for company lookups to avoid redundant API calls
const companyCache = new Map<string, CompanyIdentificationResult>();

export class CompanyIdentificationService {
  private openai: OpenAI;
  private config: CompanyIdentificationConfig;

  constructor(config: CompanyIdentificationConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.openAIApiKey,
    });
  }

  /**
   * Generate a cache key from company data
   */
  private getCacheKey(data: CompanyData): string {
    return `${data.websiteAppTitle}|${data.url}|${data.url2 || ''}|${data.appUrl}`.toLowerCase();
  }

  /**
   * Check URL patterns for known companies
   */
  private checkUrlPatterns(url: string): string | null {
    if (!url) return null;
    
    const normalizedUrl = url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
    
    for (const [pattern, company] of Object.entries(this.config.urlPatterns)) {
      if (normalizedUrl.includes(pattern.toLowerCase())) {
        return company;
      }
    }
    
    return null;
  }

  /**
   * Check app URL patterns
   */
  private checkAppUrl(appUrl: string): { company: string; parent?: string } | null {
    if (!appUrl) return null;
    
    const lowerAppUrl = appUrl.toLowerCase();
    
    // Check for company indicators in app URLs
    for (const [pattern, company] of Object.entries(this.config.urlPatterns)) {
      if (lowerAppUrl.includes(pattern.replace('.com', '').replace('.', ''))) {
        return { 
          company,
          parent: this.config.parentSubsidiaryMap[company] 
        };
      }
    }
    
    return null;
  }

  /**
   * Identify company using LLM
   */
  private async identifyWithLLM(data: CompanyData): Promise<CompanyIdentificationResult> {
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
      const response = await this.openai.chat.completions.create({
        model: this.config.modelName || 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 500,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        company: result.company || 'Unknown',
        parentCompany: result.parentCompany || this.config.parentSubsidiaryMap[result.company],
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

  /**
   * Main company identification method
   */
  async identifyCompany(data: CompanyData): Promise<CompanyIdentificationResult> {
    // Check cache first
    const cacheKey = this.getCacheKey(data);
    if (companyCache.has(cacheKey)) {
      return companyCache.get(cacheKey)!;
    }

    // Try pattern matching first (fastest)
    const urlMatch = this.checkUrlPatterns(data.url);
    if (urlMatch) {
      const result = {
        company: urlMatch,
        parentCompany: this.config.parentSubsidiaryMap[urlMatch],
        confidence: 0.9,
        reasoning: 'Matched URL pattern',
      };
      companyCache.set(cacheKey, result);
      return result;
    }

    // Check app URL
    const appMatch = this.checkAppUrl(data.appUrl);
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
      const url2Match = this.checkUrlPatterns(data.url2);
      if (url2Match) {
        const result = {
          company: url2Match,
          parentCompany: this.config.parentSubsidiaryMap[url2Match],
          confidence: 0.85,
          reasoning: 'Matched secondary URL',
        };
        companyCache.set(cacheKey, result);
        return result;
      }
    }

    // Fall back to LLM
    const llmResult = await this.identifyWithLLM(data);
    companyCache.set(cacheKey, llmResult);
    return llmResult;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    companyCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: companyCache.size,
      hitRate: 0, // Would need to track hits/misses for this
    };
  }
}