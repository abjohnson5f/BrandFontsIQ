# Sprint 1: Unique Font Identification - CORRECTED Parallel Agent Specification

**Sprint Duration:** Days 1-2  
**Number of Agents:** 3  
**Created:** May 30, 2025  
**Purpose:** Extract unique fonts from Polaris test data
**Note:** Previous references to specific font counts have been removed pending verification

## CRITICAL: Binary Success Criteria

**Target: Exact unique font count required**
- Must match verified count exactly
- No approximations allowed
- Binary pass/fail criteria
- [Specific count to be verified against source data]

## The ONE Objective

Extract unique fonts from the Polaris test data file. Period.

**Test File:** `/Users/alexjohnson/Dev Projects/Supporting Materials/Polaris Raw Test Data.xlsx`

## Level 1 Documentation Requirements

### From `font-identification-logic.md`:

> **The Fundamental Rule**
> 
> **Each weight and style variation is a UNIQUE font.**
> 
> - Helvetica Bold ≠ Helvetica Regular  
> - Gotham Medium ≠ Gotham Semi-Bold
> - Arial Italic ≠ Arial Regular
> 
> This is non-negotiable. The POC failed by trying to aggregate these.

### From `font-uniqueness-logic.md`:

> **A unique font = Base Font Name + Weight/Style Variation**
> 
> Examples:
> - "Gotham Bold" is DIFFERENT from "Gotham Medium"
> - "Helvetica Neue Light" is DIFFERENT from "Helvetica Neue Regular"
> - Each weight and style combination is a separate, licensable, measurable entity

## Font Identification Process

### From `font-identification-logic.md`:

> ## Font Identification Hierarchy
> 
> When identifying a font, check in this EXACT order:
> 
> ### 1. Font Name Column (Primary Source)
> - Start here always
> - May need standardization but is the primary identifier
> - If clear and valid → use it
> 
> ### 2. Font File Path (First Fallback)
> - Check if font name appears in the file path
> - Example: `/fonts/GothamSSm-Bold.ttf` → "Gotham SSm Bold"
> - Parse carefully, maintain weight/style info
> 
> ### 3. Other Metadata Columns (Second Fallback)
> - Scan other columns for font name information
> - [Note: Need to identify specific columns]
> 
> ### 4. Family + Subfamily (Last Resort)
> - Combine Font Family and Subfamily columns
> - Example: Family "Helvetica" + Subfamily "Bold Italic" → "Helvetica Bold Italic"
> - Only use if all other methods fail

## Standardization Requirements

### From `font-identification-logic.md`:

> ### Common Variations to Standardize
> 
> ```typescript
> const standardizationMap = {
>   // Gotham variations
>   'Gotham SSm': 'Gotham Screen Smart',
>   'Gotham Screen Space Smart': 'Gotham Screen Smart',
>   'GothamSSm': 'Gotham Screen Smart',
>   
>   // Weight variations (DO NOT REMOVE - just standardize)
>   'Bd': 'Bold',
>   'Lt': 'Light',
>   'Md': 'Medium',
>   'Rg': 'Regular',
>   'SemiBold': 'Semi-Bold',
>   'Semibold': 'Semi-Bold',
> }
> ```
> 
> ### Critical: Preserve Weight/Style Information

## What NOT to Do

### From `font-identification-logic.md`:

> ❌ **WRONG** (POC approach):
> ```typescript
> // This aggregates away important distinctions
> fonts.reduce((acc, font) => {
>   const family = removeWeightAndStyle(font.name);
>   acc[family] = (acc[family] || 0) + 1;
> });
> ```
> 
> ✅ **CORRECT**:
> ```typescript
> // Each weight/style is unique
> const uniqueFonts = new Set();
> fonts.forEach(font => {
>   const standardizedName = standardizeFontName(font.name);
>   uniqueFonts.add(standardizedName); // Includes weight/style
> });
> ```

## Implementation Requirements

**CRITICAL INSIGHT: The raw data contains many font variations. Standardization consolidates these to the correct unique count.**

1. **Read the Excel file**
   - Location: `/Users/alexjohnson/Dev Projects/Supporting Materials/Polaris Raw Test Data.xlsx`
   - Process all rows
   - You'll initially find many variations

2. **For each row, identify the font using the hierarchy**
   - Try Font Name column first
   - Fall back to file path
   - Then other columns
   - Finally Family + Subfamily

3. **Standardize the font name** ← THIS IS THE KEY STEP
   - Apply the standardization map
   - PRESERVE weight and style information
   - This consolidates variations like:
     - "Gotham SSm Bold" → "Gotham Screen Smart Bold"
     - "GothamSSm Bold" → "Gotham Screen Smart Bold"
     - "Gotham Screen Space Smart Bold" → "Gotham Screen Smart Bold"
   - Without standardization, these would count as 3 fonts instead of 1

4. **Count unique fonts AFTER standardization**
   - Use a Set or similar structure for counting unique fonts
   - Each unique STANDARDIZED name (including weight/style) counts as 1
   - The standardization process is what reduces the count to the correct number
   - **CRITICAL: Keep ALL rows/instances in your data**
     - If "Gotham Bold" appears 50 times across different brands/departments, keep all 50 instances
     - You're identifying unique fonts, NOT reducing the dataset
     - Each instance contains important metadata (brand, department, use case, etc.)
     - Think of it as: "all rows containing [verified count] unique fonts"

5. **Output the count**
   - Must equal the verified count exactly
   - If you get more: your standardization is incomplete
   - If you get less: you're over-aggregating (probably losing weight/style info)

## What This Sprint Does NOT Include

- ❌ Font source detection (that's a different sprint)
- ❌ Risk assessment (future sprint)
- ❌ Company identification (future sprint)
- ❌ Use case categorization (not needed for counting)
- ❌ Any business logic beyond identification and uniqueness

## Success Verification

```typescript
const uniqueFonts = identifyUniqueFonts(polarisData);
console.log(`Unique fonts found: ${uniqueFonts.size}`);
// Output MUST match the verified unique font count exactly
```

## Common Pitfalls

From the Level 1 documentation:

> ## Common Pitfalls to Avoid
> 
> 1. ❌ Stripping weight/style to "simplify"
> 2. ❌ Assuming font family = unique font
> 3. ❌ Using only one identification method
> 4. ❌ Counting files instead of unique fonts
> 5. ❌ Over-aggregating in the name of "cleanup"

## Testing Approach

Test against Alex's verified list of unique fonts. Any deviation requires investigation.

## What You're Building vs What You're NOT Building

### You ARE Building:
- A system that identifies and standardizes font names across 2,135 rows
- A count of unique fonts found within those rows
- A mapping that shows which standardized font each row contains

### You are NOT Building:
- A system that reduces the dataset (WRONG!)
- A deduplication system that removes "duplicate" entries
- A data reduction tool

**Example Output Structure:**
```
Original Data: [Total rows]
Unique Fonts Found: [Verified count]

Row 1: Gotham Bold → Standardized: "Gotham Bold" (Instance 1 of 47)
Row 2: GothamSSm Bold → Standardized: "Gotham Screen Smart Bold" (Instance 1 of 23)
Row 3: Gotham Bold → Standardized: "Gotham Bold" (Instance 2 of 47)
...
Row [N]: Helvetica Light → Standardized: "Helvetica Light" (Instance X of Y)
```

## Deliverables

Each agent produces:

1. **Core implementation** that reads Excel and counts unique fonts
2. **Test results** showing the exact unique font count across all rows
3. **List of all unique fonts** for verification
4. **Full dataset with standardized font names** - all rows preserved with standardized names
5. **Documentation** of any edge cases encountered

## Remember

From `font-uniqueness-logic.md`:

> **Every weight matters. Every style counts. Every variation is a business decision.**
> 
> A company using Gotham Light, Regular, and Bold is making three distinct choices with three distinct impacts. Our job is to measure each one accurately.

## The Bottom Line

The exact unique font count verified against source data. Not approximately. Not close to. Exactly matching.

If your implementation doesn't produce the verified count, it's wrong. Debug until it does.

---

*This is Sprint 1. One goal. Exact accuracy. Get it right.*