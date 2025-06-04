# Sprint 2: LLM-Based Company Identification - REAL API VALIDATION

**Sprint Duration**: 24 hours
**Agents**: 3 parallel implementations
**Purpose**: Automate company identification using REAL OpenAI API
**Critical**: This version uses actual OpenAI API calls that will incur costs

## Business Context

From `/business-context/immutable-facts/business-rules-master-list.md`:
- **Rule 4**: Company names must be 100% accurate due to hierarchy dependencies
- **Manual Process**: Currently takes 2-3 weeks per analysis
- **Data Quality**: Company names in source data are inconsistent, incomplete, or wrong

## CRITICAL IMPLEMENTATION REQUIREMENTS

### 1. USE REAL OPENAI API
```typescript
// In your test script or implementation:
const useMockProvider = false; // FORCE REAL API
// OR
process.env.USE_OPENAI = 'true'; // Set environment variable
```

### 2. Cost Controls
- Implement strict limits (e.g., max 1000 rows for testing)
- Add cost tracking and reporting
- Use GPT-3.5-turbo (not GPT-4) for cost efficiency
- Log actual costs vs estimates

### 3. Test Data Location
Use the same test data as before:
```
/Users/alexjohnson/Dev Projects/Supporting Materials/Polaris Raw Test Data_CompanyID_Test.xlsx
```

## Technical Specification

### Core Requirement
Build a system that:
1. Processes Excel data with company information
2. Uses multi-strategy approach (cache → patterns → LLM)
3. Identifies companies with 95%+ accuracy
4. Tracks ACTUAL costs from OpenAI API
5. Handles parent/subsidiary relationships

### Required Components

1. **Excel Data Processor**
   - Auto-detect company-related columns
   - Handle 25,000+ rows efficiently
   - Preserve all original data

2. **Company Identification System**
   - Domain-based detection
   - Pattern matching
   - LLM fallback with REAL API calls
   - Confidence scoring

3. **Cost Management**
   - Track tokens used
   - Calculate actual costs
   - Project full dataset costs
   - Compare to estimates

4. **Output Generation**
   - Enriched Excel file
   - Cost report with ACTUAL API costs
   - Performance metrics
   - Confidence distributions

### Implementation Constraints

1. **Must use existing test data** (no file modifications)
2. **Process up to $20 worth of rows** (estimated 2000-4000 rows)
3. **Log all API calls and responses**
4. **Track actual vs estimated costs**
5. **Maintain 83%+ cache efficiency**
6. **Stop processing when $18 spent** (safety margin)

### Key Code Patterns

From the working implementation:
```typescript
// Force real OpenAI usage
const provider = new OpenAIProvider(
  process.env.OPENAI_API_KEY || '', 
  'gpt-3.5-turbo'
);

// Add cost limiting - USE FULL BUDGET
const MAX_COST_DOLLARS = 18; // Stop at $18 (safety margin)
const COST_PER_1K_TOKENS = 0.002; // GPT-3.5-turbo pricing
let totalCostTracking = 0;

// Dynamic row limiting based on cost
const shouldContinueProcessing = () => {
  return totalCostTracking < MAX_COST_DOLLARS;
};
```

### Expected Outcomes

1. **Enriched Excel file** with real company names
2. **Accurate cost data**:
   - Actual cost per row
   - Total API costs
   - Projected costs for 25k rows
3. **Performance metrics**:
   - Cache hit rate
   - LLM call percentage
   - Processing speed
4. **Validation data**:
   - Sample of identified companies
   - Confidence score distribution
   - Parent/subsidiary mappings

### Success Criteria

1. Successfully identify 95%+ of companies
2. Actual costs under $10 for 1000 rows
3. Cache hit rate above 80%
4. Real company names in output (not mocks)
5. Accurate cost projections

### Testing Approach

1. Start with 100 rows to verify API works
2. Continue processing until $18 spent (per agent)
3. Each agent should process 2000-4000 rows
4. Compare results across 3 agents
5. Validate actual vs estimated costs
6. Generate substantial demo dataset

## CRITICAL REMINDERS

1. **This will cost real money** - up to $18 per agent ($54 total)
2. **Use GPT-3.5-turbo** not GPT-4 
3. **Implement cost-based stopping** at $18 per agent
4. **Log everything** for cost analysis
5. **Verify API key works** before starting
6. **We WANT comprehensive data** - use the budget!

## Agent-Specific Guidance

Each agent should:
1. Implement the same requirements differently
2. Track their specific cost metrics
3. Use the OpenAI API (not mocks)
4. Report actual results in RESULTS.md
5. Include sample output data

Remember: We need REAL validation data to prove the system works before customer demos.

---

*"Real tests with real APIs reveal real truth about real costs."*