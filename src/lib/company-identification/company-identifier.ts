/**
 * Company Identifier
 * Main orchestrator for company identification process
 */

import * as XLSX from 'xlsx';
import { 
  CompanyIdentificationResult, 
  ProcessingStats, 
  BatchProcessingOptions,
  IdentificationMethod,
  ColumnMapping
} from './types';
import { ColumnDetector } from './column-detector';
import { DomainParser } from './domain-parser';
import { CompanyMappings } from './company-mappings';
import { CompanyCache } from '../caching/company-cache';
import { LLMClient, LLMProvider, CompanyIdentificationInputs } from '../llm-enrichment/llm-client';

export class CompanyIdentifier {
  private cache: CompanyCache;
  private llmClient: LLMClient;
  private stats: ProcessingStats;
  private options: BatchProcessingOptions;
  
  constructor(
    llmProvider: LLMProvider,
    options: BatchProcessingOptions = {
      batchSize: 100,
      maxConcurrent: 5,
      enableCache: true,
      llmProvider: 'openai',
      maxCostLimit: 750
    }
  ) {
    this.cache = new CompanyCache();
    this.llmClient = new LLMClient(llmProvider);
    this.options = options;
    this.stats = this.initializeStats();
  }
  
  private initializeStats(): ProcessingStats {
    return {
      totalRows: 0,
      processed: 0,
      identified: 0,
      cached: 0,
      llmCalls: 0,
      estimatedCost: 0,
      actualCost: 0,
      errors: 0
    };
  }
  
  /**
   * Initialize the identifier (load cache, etc.)
   */
  async initialize(): Promise<void> {
    if (this.options.enableCache) {
      await this.cache.initialize();
    }
  }
  
  /**
   * Process an Excel file and identify companies
   */
  async processExcelFile(
    filePath: string,
    options: {
      outputPath?: string;
      onProgress?: (stats: ProcessingStats) => void;
    } = {}
  ): Promise<ProcessingStats> {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const detector = new ColumnDetector();
    const columnMapping = detector.detectFromWorkbook(workbook);
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    this.stats.totalRows = data.length - 1; // Exclude header
    
    // Process in batches
    const results: CompanyIdentificationResult[] = [];
    
    for (let i = 1; i < data.length; i += this.options.batchSize) {
      const batchEnd = Math.min(i + this.options.batchSize, data.length);
      const batch = data.slice(i, batchEnd);
      
      const batchResults = await this.processBatch(batch, columnMapping, i);
      results.push(...batchResults);
      
      // Update the Excel data
      batchResults.forEach((result, idx) => {
        const rowIndex = i + idx;
        if (columnMapping.companyIndex >= 0) {
          data[rowIndex][columnMapping.companyIndex] = result.company;
        }
      });
      
      if (options.onProgress) {
        options.onProgress(this.stats);
      }
      
      // Check cost limit
      if (this.stats.actualCost >= this.options.maxCostLimit) {
        console.warn(`Cost limit reached: $${this.stats.actualCost}`);
        break;
      }
    }
    
    // Save cache
    if (this.options.enableCache) {
      await this.cache.saveToDisk();
    }
    
    // Write output if requested
    if (options.outputPath) {
      const newWorkbook = XLSX.utils.book_new();
      const newSheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
      XLSX.writeFile(newWorkbook, options.outputPath);
    }
    
    return this.stats;
  }
  
  /**
   * Process a batch of rows
   */
  private async processBatch(
    rows: any[][],
    columnMapping: ColumnMapping,
    startIndex: number
  ): Promise<CompanyIdentificationResult[]> {
    const inputs: CompanyIdentificationInputs[] = rows.map(row => ({
      websiteAppTitle: columnMapping.websiteAppTitleIndex >= 0 ? row[columnMapping.websiteAppTitleIndex] : undefined,
      url: columnMapping.urlIndex >= 0 ? row[columnMapping.urlIndex] : undefined,
      appUrl: columnMapping.appUrlIndex >= 0 ? row[columnMapping.appUrlIndex] : undefined
    }));
    
    const results: CompanyIdentificationResult[] = [];
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      let result: CompanyIdentificationResult | null = null;
      
      try {
        // 1. Check cache first
        if (this.options.enableCache) {
          result = this.cache.get(input);
          if (result) {
            this.stats.cached++;
            results.push(result);
            continue;
          }
        }
        
        // 2. Try rule-based identification
        result = await this.identifyByRules(input);
        
        // 3. If no high-confidence result, use LLM
        if (!result || result.confidence < 70) {
          const llmResult = await this.llmClient.identifyCompany(input);
          if (!result || llmResult.confidence > result.confidence) {
            result = llmResult;
            this.stats.llmCalls++;
          }
        }
        
        // Cache the result
        if (result && this.options.enableCache) {
          this.cache.set(input, result);
        }
        
        if (result) {
          this.stats.identified++;
          results.push(result);
        } else {
          results.push({
            company: 'Unknown',
            confidence: 0,
            evidence: ['No identification possible'],
            method: IdentificationMethod.MANUAL_MAPPING
          });
        }
      } catch (error) {
        console.error(`Error processing row ${startIndex + i}:`, error);
        this.stats.errors++;
        results.push({
          company: 'Error',
          confidence: 0,
          evidence: [`Error: ${error}`],
          method: IdentificationMethod.MANUAL_MAPPING
        });
      }
      
      this.stats.processed++;
    }
    
    // Update cost stats
    const usageStats = this.llmClient.getUsageStats();
    this.stats.actualCost = usageStats.totalCost;
    
    return results;
  }
  
  /**
   * Identify company using rule-based methods
   */
  private async identifyByRules(input: CompanyIdentificationInputs): Promise<CompanyIdentificationResult | null> {
    const results: CompanyIdentificationResult[] = [];
    
    // 1. Try domain matching
    if (input.url) {
      const parsed = DomainParser.parseUrl(input.url);
      if (parsed) {
        // Check known mappings
        const mapping = CompanyMappings.findByDomain(parsed.domain);
        if (mapping) {
          results.push({
            company: mapping.company,
            parentCompany: mapping.parent,
            confidence: 95,
            evidence: [`Domain match: ${parsed.domain}`],
            method: IdentificationMethod.DOMAIN_MATCHING
          });
        } else if (parsed.potentialCompany) {
          results.push({
            company: parsed.potentialCompany,
            confidence: 70,
            evidence: [`Extracted from domain: ${parsed.domain}`],
            method: IdentificationMethod.DOMAIN_MATCHING
          });
        }
      }
    }
    
    // 2. Try app bundle ID matching
    if (input.appUrl) {
      const bundleMapping = CompanyMappings.findByBundleId(input.appUrl);
      if (bundleMapping) {
        results.push({
          company: bundleMapping.company,
          parentCompany: bundleMapping.parent,
          confidence: 90,
          evidence: [`Bundle ID match: ${input.appUrl}`],
          method: IdentificationMethod.APP_BUNDLE_ID
        });
      } else {
        const parsed = DomainParser.parseAppBundleId(input.appUrl);
        if (parsed) {
          results.push({
            company: parsed.company,
            confidence: 65,
            evidence: [`Extracted from bundle ID: ${input.appUrl}`],
            method: IdentificationMethod.APP_BUNDLE_ID
          });
        }
      }
    }
    
    // 3. Try title analysis
    if (input.websiteAppTitle) {
      const keywordMatch = CompanyMappings.findByKeywords(input.websiteAppTitle);
      if (keywordMatch) {
        results.push({
          company: keywordMatch.company,
          parentCompany: keywordMatch.parent,
          confidence: 85,
          evidence: [`Title keyword match: ${input.websiteAppTitle}`],
          method: IdentificationMethod.TITLE_ANALYSIS
        });
      } else {
        // Extract company name from title
        const extracted = this.extractCompanyFromTitle(input.websiteAppTitle);
        if (extracted) {
          results.push({
            company: extracted,
            confidence: 60,
            evidence: [`Extracted from title: ${input.websiteAppTitle}`],
            method: IdentificationMethod.TITLE_ANALYSIS
          });
        }
      }
    }
    
    // Return highest confidence result
    if (results.length === 0) return null;
    
    return results.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
  }
  
  /**
   * Extract company name from title
   */
  private extractCompanyFromTitle(title: string): string | null {
    // Remove common suffixes
    let cleaned = title
      .replace(/\s*(app|application|website|site|portal|platform)\s*$/i, '')
      .replace(/\s*-\s*/, ' ')
      .trim();
    
    // Check if it looks like a company name
    if (cleaned.length > 2 && cleaned.length < 50) {
      // Capitalize properly
      return cleaned.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    return null;
  }
  
  /**
   * Get current processing statistics
   */
  getStats(): ProcessingStats {
    return { ...this.stats };
  }
  
  /**
   * Export identification report
   */
  async exportReport(outputPath: string): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      cacheStats: this.cache.getStats(),
      llmStats: this.llmClient.getUsageStats(),
      costBreakdown: {
        llmCost: this.stats.actualCost,
        costPerRow: this.stats.processed > 0 ? this.stats.actualCost / this.stats.processed : 0,
        projectedCostFor25k: (this.stats.actualCost / Math.max(1, this.stats.processed)) * 25000
      }
    };
    
    const { promises: fs } = await import('fs');
    await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
  }
}