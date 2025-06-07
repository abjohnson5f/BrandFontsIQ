# Company Identification Module

## Overview
This module identifies companies from website/app metadata using a multi-strategy approach: cache → pattern matching → LLM API.

## Key Features
- ✅ 99% accuracy on Polaris dataset (2,135 rows)
- ✅ Configuration-based (NO hardcoded values - Immutable Truth #2)
- ✅ Parallel processing with rate limiting
- ✅ Batch API calls for efficiency
- ✅ Parent/subsidiary relationship mapping
- ✅ Progress tracking for UI integration

## Usage

```typescript
import { identifyCompanies, identifyCompany } from './source-code';

// Single company
const result = await identifyCompany({
  websiteAppTitle: "AIXAM ABB VSP",
  url: "abb-vsp.com",
  url2: "",
  appUrl: ""
});

// Batch processing
const results = await identifyCompanies(dataArray, {
  concurrency: 6,    // Rate-limited for API safety
  batchSize: 10,     // Companies per API call
  modelName: 'gpt-4-turbo-preview', // Configurable
  onProgress: (current, total) => {
    console.log(`Progress: ${current}/${total}`);
  }
});
```

## Configuration

Edit `../configuration.json`:

```json
{
  "companyIdentification": {
    "parentSubsidiaryMap": {
      "Aixam": "Polaris Inc",
      "Indian Motorcycle": "Polaris Inc"
    },
    "urlPatterns": {
      "polaris.com": "Polaris Inc",
      "aixam.com": "Aixam"
    }
  }
}
```

## Performance
- Cache hit: ~1ms per company
- Pattern match: ~5ms per company
- LLM call: ~1000ms per company (batched)
- Full dataset (2,135 rows): < 5 minutes

## Critical Implementation Details
1. **Index Integrity**: Row 1,847 ALWAYS gets row 1,847's result
2. **Graceful Degradation**: Missing config → uses LLM only
3. **Partial Success**: One batch fails → others continue
4. **Rate Limiting**: Max 6 concurrent API requests
5. **Timeout Protection**: 30-second timeout per API call

## Testing
```bash
cd tests
npm test
```

## DO NOT USE
- Any files in `_ARCHIVE/` directory
- Any version without these protections