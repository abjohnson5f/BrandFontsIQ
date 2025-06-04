/**
 * Company Identification Types
 * Core interfaces for the company identification system
 */

export interface CompanySourceColumns {
  websiteAppTitle: string;  // Column E - "Website/App Title"
  url: string;              // Column F - "URL"
  appUrl: string;           // Column AF - "App URL" 
  companyColumn: string;    // Column D - Target column (STARTS EMPTY)
}

export interface CompanyIdentificationResult {
  company: string;          // Identified company name
  parentCompany?: string;   // Parent company if subsidiary
  confidence: number;       // 0-100 confidence score
  evidence: string[];       // What led to this identification
  method: IdentificationMethod;
  needsReview?: boolean;    // Flag for manual review
}

export enum IdentificationMethod {
  DOMAIN_MATCHING = 'domain_matching',
  TITLE_ANALYSIS = 'title_analysis',
  APP_BUNDLE_ID = 'app_bundle_id',
  LLM_RESOLUTION = 'llm_resolution',
  MANUAL_MAPPING = 'manual_mapping',
  CACHED_RESULT = 'cached_result'
}

export interface CompanyHierarchy {
  parentCompany: string;
  subsidiaries: Map<string, SubsidiaryInfo>;
  domainPatterns: Map<string, string>;  // domain → company mapping
  titleKeywords: Map<string, string>;   // keywords → company mapping
  appBundleIds: Map<string, string>;    // bundle → company mapping
}

export interface SubsidiaryInfo {
  name: string;
  parentCompany: string;
  identifiers: {
    domains?: string[];
    keywords?: string[];
    bundleIds?: string[];
  };
}

export interface ProcessingStats {
  totalRows: number;
  processed: number;
  identified: number;
  cached: number;
  llmCalls: number;
  estimatedCost: number;
  actualCost: number;
  errors: number;
}

export interface ColumnMapping {
  websiteAppTitleIndex: number;
  urlIndex: number;
  appUrlIndex: number;
  companyIndex: number;
}

export interface BatchProcessingOptions {
  batchSize: number;
  maxConcurrent: number;
  enableCache: boolean;
  llmProvider: 'openai' | 'anthropic';
  maxCostLimit: number;
}