# Company Identification - Implementation Files

## Permanent Source Code Location

### Core Implementation
```
/Users/alexjohnson/Dev Projects/GitHub/BrandFontsIQ-vNextJS15/WINNING-IMPLEMENTATIONS/company-identification/source-code/companyIdentification.ts
```

### Full Dataset Processor
```
/Users/alexjohnson/Dev Projects/GitHub/BrandFontsIQ-vNextJS15/WINNING-IMPLEMENTATIONS/company-identification/source-code/identify-companies.ts
```

## Original Development Location (WILL BE DELETED)
```
Original location: /trees/company_id_v3-3/
Status: Temporary - will be removed by prepare-sprint.sh
```

### Test Scripts
```
/Users/alexjohnson/Dev Projects/GitHub/BrandFontsIQ-vNextJS15/trees/company_id_v3-3/scripts/test-company-identification.ts
/Users/alexjohnson/Dev Projects/GitHub/BrandFontsIQ-vNextJS15/trees/company_id_v3-3/scripts/identify-companies-sample.ts
```

### Output Examples
```
# Full dataset output (2,135 rows processed)
/Users/alexjohnson/Dev Projects/GitHub/BrandFontsIQ-vNextJS15/trees/company_id_v3-3/output/Polaris_CompanyID_Enriched_v3.xlsx

# Sample output (50 rows)
/Users/alexjohnson/Dev Projects/GitHub/BrandFontsIQ-vNextJS15/trees/company_id_v3-3/output/Polaris_CompanyID_Sample_v3.xlsx
```

## How to Access

```bash
# View the implementation
cd /Users/alexjohnson/Dev Projects/GitHub/BrandFontsIQ-vNextJS15/trees/company_id_v3-3
cat src/lib/companyIdentification.ts

# Run the test
npx tsx scripts/test-company-identification.ts

# Process full dataset
npx tsx scripts/identify-companies.ts
```

## Key Implementation Details

- Uses OpenAI GPT-4 Turbo
- Implements caching for efficiency
- Pattern matching for known companies
- Properly preserves all original data
- Adds new columns at the end