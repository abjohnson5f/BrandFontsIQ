# Assembly Requirements - What's Needed for Integration

## Current Problems with Assembly

### 1. **Modules are Scripts, Not Services**
Current: Each winning implementation is a full script that reads/writes Excel
Needed: Pure business logic modules that can be called by a main application

### 2. **No Shared Data Model**
Current: Each module defines its own interfaces
Needed: Shared data model that flows through all enrichment steps

### 3. **Missing Orchestration Layer**
Current: Modules run independently
Needed: Main application that orchestrates the pipeline

## Required Refactoring for Assembly

### Step 1: Extract Pure Business Logic
```typescript
// companyIdentificationService.ts (pure logic)
export class CompanyIdentificationService {
  async identifyCompany(data: CompanyData): Promise<CompanyIdentificationResult> {
    // Just the identification logic, no Excel I/O
  }
}

// fontStandardizationService.ts (pure logic)
export class FontStandardizationService {
  standardizeFont(fontName: string): FontIdentificationResult {
    // Just the standardization logic, no Excel I/O
  }
}
```

### Step 2: Create Shared Data Model
```typescript
// shared/types.ts
export interface FontUsageRow {
  // Original columns
  fontName: string;
  url: string;
  websiteAppTitle: string;
  // ... other original columns
  
  // Enrichment columns (added by our modules)
  identifiedCompany?: string;
  parentCompany?: string;
  companyConfidence?: number;
  standardizedFontName?: string;
  fontComponents?: FontComponents;
}
```

### Step 3: Build Orchestration Layer
```typescript
// services/enrichmentPipeline.ts
export class EnrichmentPipeline {
  constructor(
    private companyService: CompanyIdentificationService,
    private fontService: FontStandardizationService
  ) {}
  
  async processDataset(rows: FontUsageRow[]): Promise<FontUsageRow[]> {
    // Step 1: Company identification
    rows = await this.enrichWithCompanies(rows);
    
    // Step 2: Font standardization
    rows = this.enrichWithFonts(rows);
    
    // Step 3: Calculate unique fonts by company
    const summary = this.calculateSummary(rows);
    
    return rows;
  }
}
```

## What This Means

**Current State**: Working implementations but as isolated scripts
**Needed State**: Refactored into services that can be assembled

## Options:

1. **Refactor During Assembly** (Recommended)
   - Keep current implementations as reference
   - Extract clean services during final assembly
   - Build proper integration layer

2. **Refactor Now**
   - More work upfront
   - Risk of breaking working code
   - Delays other sprints

3. **Continue As-Is, Hope for the Best**
   - High risk of integration failures
   - Difficult assembly phase
   - Not recommended

## Recommendation

Continue with current approach BUT:
1. Keep implementations modular (like they are)
2. Document interfaces clearly (like we're doing)
3. Plan for refactoring during assembly phase
4. Each sprint should produce working code we can extract from

The assembly phase will involve:
- Extracting business logic from scripts
- Creating unified data model
- Building orchestration layer
- Integrating UI

This is normal for MVP development - prove it works first, then refactor for production.