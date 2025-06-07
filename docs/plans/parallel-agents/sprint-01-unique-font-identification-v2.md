# Sprint 1: Unique Font Identification - Parallel Agent Specification v2

**Sprint Duration:** Days 1-2  
**Number of Agents:** 3  
**Created:** June 1, 2025  
**Purpose:** Identify and count unique fonts from Polaris test data

## High-Level Objectives

### Primary Goal
Analyze the Polaris test data to identify and count all unique fonts, where each weight and style variation represents a distinct font.

### Success Criteria
- Produce a deterministic, repeatable count of unique fonts
- Generate a comprehensive list of all unique fonts found
- Maintain full traceability from raw data to final count
- Preserve all metadata while identifying uniqueness

## Mid-Level Implementation Strategy

### Core Principles
1. **Font Uniqueness Definition**: Base Font Name + Weight/Style = Unique Font
2. **Data Preservation**: Keep all rows while identifying unique fonts across them
3. **Standardization First**: Apply consistent naming before counting
4. **Verification Through Testing**: Results must be reproducible across all agents

### Three Parallel Tracks

#### Track 1: Excel Processing & Data Extraction
- **Focus**: Reliable Excel file reading and data structure understanding
- **Deliverables**: 
  - Clean data extraction pipeline
  - Column mapping documentation
  - Raw data statistics (total rows, columns used)

#### Track 2: Font Identification & Standardization
- **Focus**: Implementing the font identification hierarchy and standardization rules
- **Deliverables**:
  - Font identification logic implementation
  - Standardization mapping application
  - Edge case documentation

#### Track 3: Unique Font Counting & Verification
- **Focus**: Accurate counting methodology and result validation
- **Deliverables**:
  - Unique font counting algorithm
  - Complete list of unique fonts discovered
  - Count verification methodology

## Low-Level Technical Details

### Data Source
**Test File:** `/Users/alexjohnson/Dev Projects/Supporting Materials/Polaris Raw Test Data.xlsx`

### Font Identification Hierarchy
Process fonts in this exact order:

1. **Font Name Column** (Primary)
   - Direct font name if clear and valid
   - May require standardization

2. **Font File Path** (First Fallback)
   - Extract font name from file path
   - Example: `/fonts/GothamSSm-Bold.ttf` → "Gotham SSm Bold"

3. **Other Metadata Columns** (Second Fallback)
   - Scan additional columns for font information
   - Document which columns contain font data

4. **Family + Subfamily** (Last Resort)
   - Combine Font Family and Subfamily columns
   - Example: "Helvetica" + "Bold Italic" → "Helvetica Bold Italic"

### Standardization Rules

#### Key Mappings
```typescript
const standardizationMap = {
  // Gotham variations
  'Gotham SSm': 'Gotham Screen Smart',
  'Gotham Screen Space Smart': 'Gotham Screen Smart',
  'GothamSSm': 'Gotham Screen Smart',
  
  // Weight variations (standardize but preserve)
  'Bd': 'Bold',
  'Lt': 'Light',
  'Md': 'Medium',
  'Rg': 'Regular',
  'SemiBold': 'Semi-Bold',
  'Semibold': 'Semi-Bold',
}
```

#### Critical Rules
- **PRESERVE** all weight and style information
- **STANDARDIZE** naming variations to consistent forms
- **NEVER** aggregate different weights/styles together

### Implementation Requirements

#### Step 1: Data Extraction
- Read all rows from the Excel file
- Map column headers to identify font-related fields
- Document data structure and patterns found

#### Step 2: Font Identification
- Apply the identification hierarchy to each row
- Handle missing or malformed data gracefully
- Track which identification method succeeded for each row

#### Step 3: Standardization
- Apply standardization rules consistently
- Maintain mapping of original → standardized names
- Document any ambiguous cases requiring decisions

#### Step 4: Unique Font Counting
- Use Set or similar structure for uniqueness
- Count is based on STANDARDIZED names including weight/style
- Maintain full list of unique fonts discovered

#### Step 5: Verification
- Ensure count is deterministic and reproducible
- Cross-verify between different implementation approaches
- Document the final count and methodology

### What This Sprint Excludes
- ❌ Font source detection (Adobe, Google, etc.)
- ❌ Risk assessment or licensing analysis
- ❌ Company/department identification
- ❌ Use case categorization
- ❌ Any business logic beyond identification

### Common Pitfalls to Avoid

1. **Over-Aggregation**
   - ❌ Treating "Helvetica Bold" and "Helvetica Regular" as one font
   - ✅ Each weight/style combination is unique

2. **Under-Standardization**
   - ❌ Counting "GothamSSm Bold" and "Gotham SSm Bold" as different
   - ✅ Standardize variations to canonical forms

3. **Data Reduction**
   - ❌ Outputting only unique fonts (losing instance data)
   - ✅ Preserving all rows while identifying uniqueness

### Expected Output Structure

```
Analysis Complete:
- Total Rows Analyzed: [count]
- Unique Fonts Identified: [count]
- Identification Methods Used:
  - Font Name Column: [X] instances
  - File Path Parsing: [Y] instances
  - Family + Subfamily: [Z] instances

Sample Unique Fonts:
1. Gotham Bold
2. Gotham Screen Smart Bold
3. Helvetica Light
4. Helvetica Regular
... [complete list]

Standardization Applied:
- "GothamSSm Bold" → "Gotham Screen Smart Bold" (X instances)
- "Bd" → "Bold" (Y instances)
... [all transformations]
```

### Deliverables Per Agent

1. **Implementation Code**
   - Excel reading functionality
   - Font identification logic
   - Standardization application
   - Unique counting algorithm

2. **Results Documentation**
   - Total unique fonts discovered
   - Complete list of unique fonts
   - Methodology documentation
   - Edge cases encountered

3. **Verification Artifacts**
   - Test results showing consistency
   - Mapping of rows to unique fonts
   - Standardization transformation log

### Testing & Validation

Each agent should:
- Run their implementation multiple times to ensure consistency
- Document any ambiguous cases and decisions made
- Provide clear rationale for their final count
- Share findings that might affect other agents' approaches

### Collaboration Points

While working in parallel, agents should:
- Share discovered edge cases via documentation
- Note any ambiguities in the data structure
- Document standardization decisions for consistency
- Avoid modifying shared test data

## Key Domain Knowledge

### Font Industry Standards
- Each weight and style represents a separately licensable asset
- Font families can have dozens of variations
- Naming conventions vary by foundry and designer
- Standardization is critical for accurate measurement

### Business Context
- Enterprises often use many variations unknowingly
- Each variation has cost and compliance implications
- Accurate counting is foundational to all other analysis
- This data feeds risk assessment and optimization recommendations

## Success Metrics

The sprint succeeds when:
1. All three agents produce the same unique font count
2. The methodology is clearly documented and reproducible
3. A complete list of unique fonts is generated
4. The approach handles all edge cases in the data

---

*This specification enables parallel development while ensuring consistent results through clear objectives, standardization rules, and verification requirements.*