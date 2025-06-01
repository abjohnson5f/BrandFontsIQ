# Sprint 1: Unique Font Identification - Parallel Agent Specification

**Sprint Duration:** Days 1-2  
**Number of Agents:** 3  
**Created:** June 1, 2025  
**Purpose:** Build a system to accurately identify and count unique fonts from enterprise font audit data

## High-Level Objective

Create a font identification system that extracts and counts unique fonts from Excel data, where each weight and style variation is considered a distinct, licensable font.

## Mid-Level Objectives

- [ ] Parse Excel file and extract font information from multiple columns
- [ ] Implement font name standardization while preserving weight/style
- [ ] Count unique fonts after standardization
- [ ] Generate comprehensive report with all instances preserved

## Technical Context

### Business Rule: Font Uniqueness

**Each weight and style variation is a UNIQUE font:**
- Helvetica Bold ≠ Helvetica Regular  
- Gotham Medium ≠ Gotham Semi-Bold
- Arial Italic ≠ Arial Regular

This is non-negotiable. Each variation has different licensing requirements and costs.

### Input Data

**File:** `/data/polaris-test-data.xlsx`  
**Rows:** 2,135 font instances  
**Challenge:** Raw data contains many variations of the same font that need standardization

## Implementation Requirements

### 1. Font Identification Hierarchy

Check columns in this order:
1. **Font Name Column** - Primary source
2. **Font File Path** - Parse font names from paths like `/fonts/GothamSSm-Bold.ttf`
3. **Other Metadata** - Scan remaining columns for font information
4. **Family + Subfamily** - Combine as last resort

### 2. Standardization Rules

```typescript
// Key standardizations to implement
'Gotham SSm' → 'Gotham Screen Smart'
'GothamSSm' → 'Gotham Screen Smart'
'Bd' → 'Bold'
'Lt' → 'Light'
'Md' → 'Medium'
'SemiBold' → 'Semi-Bold'
```

### 3. Critical Implementation Details

- **DO NOT** remove weight/style information
- **DO NOT** aggregate fonts by family
- **KEEP** all 2,135 rows - you're identifying unique fonts, not reducing data
- **COUNT** unique standardized names (with weight/style)

### 4. Example Processing

```
Raw Input: "GothamSSm Bold", "Gotham SSm Bold", "Gotham Bold"
After Standardization: All become "Gotham Screen Smart Bold"
Result: 1 unique font (appearing 3 times)
```

## Success Criteria

1. **Accuracy**: Correctly identify each unique font including weight/style
2. **Consistency**: Same font variations map to same standardized name
3. **Completeness**: Process all 2,135 rows successfully
4. **Verifiability**: Provide list of unique fonts found for validation

## Deliverables

Each agent should produce:

1. **Implementation** (`/src/lib/font-identifier/`)
   - Excel parsing logic
   - Standardization engine
   - Unique counting algorithm

2. **Results Report** showing:
   - Total rows processed: 2,135
   - Unique fonts found: [your count]
   - Top 10 most frequent fonts
   - Complete list of unique fonts

3. **Test Results** demonstrating accuracy

4. **Full Dataset** with standardized names (all 2,135 rows preserved)

## Technical Stack

- Next.js 15 with TypeScript
- Use `xlsx` package for Excel parsing
- Implement in `/src/lib/` directory
- Create API route at `/app/api/fonts/identify/route.ts`

## Common Pitfalls to Avoid

1. ❌ Stripping weight/style to "simplify"
2. ❌ Assuming font family = unique font
3. ❌ Using only one identification method
4. ❌ Reducing the dataset instead of identifying
5. ❌ Over-aggregating in the name of "cleanup"

## Evaluation

The three agent implementations will be evaluated on:
- Accuracy of unique font count
- Correctness of standardization
- Code quality and maintainability
- Performance on full dataset

Remember: We're discovering the true count through proper methodology, not hitting a predetermined target.