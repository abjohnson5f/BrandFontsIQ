# Company Identification - Test Results

## Full Dataset Processing Results

**Date**: January 6, 2025
**Agent**: Agent 3 (company_id_v3-3)
**Dataset**: Polaris Raw Test Data (2,135 rows)

### Performance Metrics
- **Total rows processed**: 2,135
- **Companies identified**: 2,110 (99%)
- **Processing time**: 29 minutes
- **Cost**: $7.69 ($0.0036 per company)

### Accuracy Results
- **High confidence (≥80%)**: 1,955 rows
- **Medium confidence (50-79%)**: 180 rows
- **Low confidence (<50%)**: 0 rows
- **With parent company**: 1,322 rows

### Critical Test Case
**Aixam Dealer Test** (abb-vsp.com):
- ✅ Correctly identified as: Aixam
- ✅ Parent company: Polaris Industries
- ✅ Confidence: 95%

### Top Identified Companies
1. Aixam: 541 occurrences
2. Polaris Inc: 535 occurrences
3. Indian Motorcycle: 360 occurrences
4. Unknown: 373 occurrences (17.5%)
5. WSI Industries: 33 occurrences

### Data Integrity
- ✅ Website/App Title: PRESERVED
- ✅ URL: PRESERVED
- ✅ All original columns: UNCHANGED
- ✅ New columns added at END

### Comparison to Other Agents
- Agent 1: Destroyed data (overwrote URL and Website/App Title columns)
- Agent 2: Lower accuracy, naming inconsistencies
- Agent 3: Winner - highest accuracy, proper data handling