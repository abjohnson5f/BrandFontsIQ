# Agent 3 Company Identification - Implementation Specification

## Proven Working Implementation (Agent 3)

### Core Technical Approach
```typescript
// From Agent 3's actual implementation:
1. Multi-strategy identification:
   - In-memory cache (30% efficiency)
   - Pattern matching (9% of cases)
   - LLM API calls (61% of cases)

2. Uses GPT-4 Turbo with JSON response format

3. Processes these exact columns:
   - Website/App Title
   - URL
   - App URL
   - (URL 2 if present)

4. Adds new columns at END of spreadsheet:
   - Company (standardized name)
   - Parent Company
   - Confidence (0-100)

5. NEVER modifies original data columns
```

### Actual Performance Metrics
- 2,135 rows: 29 minutes (current)
- 99% identification rate
- $7.69 for full dataset ($0.0036 per company)
- Successfully identified Aixam from dealer site

## Enhanced MVP Implementation

### Speed Optimizations (To Be Added)
```typescript
// Adaptive parallelization based on file size
const getThreadCount = (rows: number) => {
  if (rows < 500) return 5;
  if (rows < 2000) return 20;
  if (rows < 5000) return 50;
  return 100; // Maximum for 5000+ rows
};

// Batch processing for LLM calls
const batchSize = 10; // 10 companies per API call
```

### Target Performance
- 500 rows: < 1 minute
- 2,135 rows: < 5 minutes  
- 5,000 rows: < 10 minutes
- 25,000 rows: ~30 minutes (edge case)

### UI/UX Flow
```
1. User clicks "Enrich Company Data"
2. Progress bar appears:
   "Enriching company data...
   [████████░░] 1,847 of 2,135 companies identified"
3. Process completes
4. Optional: Inline editing for corrections
   - Bulk update (e.g., all "Polaris Industries" → "Polaris Inc.")
```

### Critical Implementation Details

#### MUST PRESERVE (From Agent 3):
- Column reading logic (by name, not position)
- Parent company detection
- Name standardization approach
- Confidence scoring
- Cache + pattern + LLM strategy

#### MUST ADD:
- Parallel processing (auto-scaled)
- Batch API calls
- Progress indication
- Post-process bulk editing

#### MUST NOT DO:
- Overwrite original columns (Agent 1's mistake)
- Create shared company database
- Ask user to choose processing modes
- Show cost information
- Allow 4-hour processing times

### File References
- Agent 3 implementation: `/trees/company_id_v3-3/src/lib/companyIdentification.ts`
- Test script: `/trees/company_id_v3-3/scripts/identify-companies.ts`
- Output example: `/trees/company_id_v3-3/output/Polaris_CompanyID_Enriched_v3.xlsx`

### Next Steps
1. Extract Agent 3's exact logic
2. Add parallelization layer
3. Implement batch processing
4. Build progress UI
5. Add bulk edit capability

---

**This document captures the EXACT working approach from Agent 3 plus the agreed enhancements. No conceptual hand-waving - this is what worked and what we're building.**