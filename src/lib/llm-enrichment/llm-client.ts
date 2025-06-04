/**
 * LLM Client
 * Handles integration with LLM providers for company identification
 */

import OpenAI from 'openai';
import { CompanyIdentificationResult } from '../company-identification/types';

export interface LLMProvider {
  identify(inputs: CompanyIdentificationInputs): Promise<LLMResponse>;
  estimateCost(tokens: number): number;
}

export interface CompanyIdentificationInputs {
  websiteAppTitle?: string;
  url?: string;
  appUrl?: string;
  context?: string;
}

export interface LLMResponse {
  company: string;
  parentCompany?: string;
  confidence: number;
  reasoning: string;
  tokensUsed: number;
}

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;
  private costPer1kTokens: number;
  
  constructor(apiKey: string, model: string = 'gpt-3.5-turbo') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
    
    // Cost estimates (as of 2024)
    this.costPer1kTokens = model === 'gpt-4' ? 0.03 : 0.002;
  }
  
  async identify(inputs: CompanyIdentificationInputs): Promise<LLMResponse> {
    const prompt = this.buildPrompt(inputs);
    
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a company identification expert. Your task is to identify companies from provided data with high accuracy. Always provide:
1. The company name (standardized format)
2. Parent company if it's a subsidiary
3. Confidence score (0-100)
4. Brief reasoning for your identification

Output format must be valid JSON:
{
  "company": "Company Name",
  "parentCompany": "Parent Company Name" or null,
  "confidence": 85,
  "reasoning": "Identified based on domain pattern matching polaris.com"
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Low temperature for consistency
        max_tokens: 200
      });
      
      const response = completion.choices[0].message.content;
      const tokensUsed = completion.usage?.total_tokens || 0;
      
      // Parse response
      try {
        const parsed = JSON.parse(response || '{}');
        return {
          company: parsed.company || 'Unknown',
          parentCompany: parsed.parentCompany || undefined,
          confidence: parsed.confidence || 0,
          reasoning: parsed.reasoning || 'No reasoning provided',
          tokensUsed
        };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          company: 'Unknown',
          confidence: 0,
          reasoning: 'Failed to parse LLM response',
          tokensUsed
        };
      }
    } catch (error) {
      throw new Error(`LLM identification failed: ${error}`);
    }
  }
  
  private buildPrompt(inputs: CompanyIdentificationInputs): string {
    const parts: string[] = ['Identify the company from the following information:'];
    
    if (inputs.websiteAppTitle) {
      parts.push(`Website/App Title: "${inputs.websiteAppTitle}"`);
    }
    if (inputs.url) {
      parts.push(`URL: "${inputs.url}"`);
    }
    if (inputs.appUrl) {
      parts.push(`App URL/Bundle ID: "${inputs.appUrl}"`);
    }
    if (inputs.context) {
      parts.push(`Additional Context: ${inputs.context}`);
    }
    
    parts.push('\nConsiderations:');
    parts.push('- Look for company names in domains, titles, and bundle IDs');
    parts.push('- Identify parent companies for known subsidiaries');
    parts.push('- Consider international variations and common abbreviations');
    parts.push('- Be aware of white-label applications and shared hosting');
    
    return parts.join('\n');
  }
  
  estimateCost(tokens: number): number {
    return (tokens / 1000) * this.costPer1kTokens;
  }
}

export class MockLLMProvider implements LLMProvider {
  async identify(inputs: CompanyIdentificationInputs): Promise<LLMResponse> {
    // Mock implementation for testing
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
    
    // Simple mock logic
    let company = 'Unknown Company';
    let confidence = 50;
    let parentCompany: string | undefined;
    
    if (inputs.url?.includes('polaris')) {
      company = 'Polaris Digital Division';
      parentCompany = 'Polaris Inc';
      confidence = 90;
    } else if (inputs.websiteAppTitle?.toLowerCase().includes('aixam')) {
      company = 'AIXAM';
      confidence = 85;
    }
    
    return {
      company,
      parentCompany,
      confidence,
      reasoning: 'Mock identification based on keywords',
      tokensUsed: 150
    };
  }
  
  estimateCost(tokens: number): number {
    return 0; // Free for testing
  }
}

export class LLMClient {
  private provider: LLMProvider;
  private totalTokensUsed: number = 0;
  private totalCost: number = 0;
  
  constructor(provider: LLMProvider) {
    this.provider = provider;
  }
  
  async identifyCompany(inputs: CompanyIdentificationInputs): Promise<CompanyIdentificationResult> {
    const response = await this.provider.identify(inputs);
    
    // Track usage
    this.totalTokensUsed += response.tokensUsed;
    this.totalCost += this.provider.estimateCost(response.tokensUsed);
    
    return {
      company: response.company,
      parentCompany: response.parentCompany,
      confidence: response.confidence,
      evidence: [response.reasoning],
      method: 'llm_resolution' as any
    };
  }
  
  async batchIdentify(
    inputsList: CompanyIdentificationInputs[],
    options: {
      maxConcurrent?: number;
      onProgress?: (completed: number, total: number) => void;
    } = {}
  ): Promise<CompanyIdentificationResult[]> {
    const maxConcurrent = options.maxConcurrent || 5;
    const results: CompanyIdentificationResult[] = [];
    
    // Process in batches
    for (let i = 0; i < inputsList.length; i += maxConcurrent) {
      const batch = inputsList.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(
        batch.map(inputs => this.identifyCompany(inputs))
      );
      
      results.push(...batchResults);
      
      if (options.onProgress) {
        options.onProgress(Math.min(i + maxConcurrent, inputsList.length), inputsList.length);
      }
    }
    
    return results;
  }
  
  getUsageStats(): {
    totalTokens: number;
    totalCost: number;
    avgTokensPerRequest: number;
  } {
    return {
      totalTokens: this.totalTokensUsed,
      totalCost: this.totalCost,
      avgTokensPerRequest: this.totalTokensUsed / Math.max(1, this.totalCost / this.provider.estimateCost(1000))
    };
  }
  
  resetStats(): void {
    this.totalTokensUsed = 0;
    this.totalCost = 0;
  }
}