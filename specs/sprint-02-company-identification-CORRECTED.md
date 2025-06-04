# Sprint 2: LLM-Based Company Identification - CORRECTED SPECIFICATION

**Sprint Duration**: 24 hours
**Agents**: 3 parallel implementations
**Purpose**: Automate company identification using OpenAI API
**Critical**: This specification corrects the column detection failure

## Business Context

From `/business-context/immutable-facts/business-rules-master-list.md`:

### Rule 7: Company Identification
- **Current State**: Manual process taking weeks
- **Data Sources**: 
  - Website/App Title (Column F in production)
  - URL (Column G in production)
  - URL 2 (Column H in production)
  - App URL (Column AH in production - far right)
- **Solution**: LLM-powered automation required
- **Complexity**: Parent-subsidiary hierarchies

## CRITICAL IMPLEMENTATION REQUIREMENTS

### 1. EXACT Column Usage

**YOU MUST USE THESE SPECIFIC COLUMNS FOR COMPANY IDENTIFICATION:**
- Column named **"Website/App Title"**
- Column named **"URL"**
- Column named **"URL 2"**
- Column named **"App URL"**

**DO NOT:**
- Auto-detect columns
- Search for columns containing "company", "vendor", etc.
- Use any other columns
- Make assumptions about which columns contain company data

### 2. Real-World Example - Aixam

From actual data showing why these specific columns matter:
- **URL**: "abb-vsp.com"
- **Website/App Title**: "ABB VSP VOITURES SANS PERMIS THIONVILLE • MOSELLE (57)"
- **Challenge**: URL doesn't reveal "Aixam" - it's a dealer site
- **Solution**: LLM must understand this is a dealer for Aixam vehicles

This example demonstrates why:
1. Simple pattern matching fails
2. We need ALL specified columns
3. Context from title + URL is critical
4. Domain expertise encoded in column selection

### 3. Test Data Location
```
/Users/alexjohnson/Dev Projects/Supporting Materials/Polaris Raw Test Data_CompanyID_Test.xlsx
```

Note: Test data has fewer columns than production, so column LETTERS differ but column NAMES are the same.

## Technical Specification

### Core Requirement
Build a system that:
1. Reads ONLY the specified columns for company identification
2. Uses multi-strategy approach (cache → patterns → LLM)
3. Identifies companies with 95%+ accuracy
4. Handles parent/subsidiary relationships
5. Processes dealer/distributor relationships correctly

### Required Components

1. **Excel Data Processor**
   ```typescript
   // MUST find these exact column names
   const requiredColumns = [
     'Website/App Title',
     'URL',
     'URL 2',
     'App URL'
   ];
   
   // Verify all columns exist or error
   const columnIndices = requiredColumns.map(name => {
     const index = headers.indexOf(name);
     if (index === -1) {
       throw new Error(`Required column "${name}" not found`);
     }
     return index;
   });
   ```

2. **Company Identification System**
   - Combine data from ALL four columns
   - Use LLM to interpret relationships
   - Handle cases like Aixam dealer example
   - Maintain confidence scoring

3. **Parent-Subsidiary Mapping**
   ```typescript
   // Example from business context
   // Input: Various Polaris subsidiary sites
   // Output: All map to "Polaris Inc" as parent
   ```

4. **Output Generation**
   - Fill the empty "Company" column with identified companies
   - Add parent company mapping
   - Include confidence scores
   - Preserve all original data

### Implementation Constraints

1. **Column Usage**: MUST use only the 4 specified columns
2. **No Auto-Detection**: Explicitly find columns by name
3. **Context Awareness**: Combine all column data for LLM
4. **Accuracy Focus**: Better to process slowly than miss companies

### Example Transformations

**Case 1: Dealer Site (Aixam)**
- Website/App Title: "ABB VSP VOITURES SANS PERMIS..."
- URL: "abb-vsp.com"
- URL 2: [empty]
- App URL: [empty]
- **Result**: Company = "Aixam", Confidence = 85%

**Case 2: Direct Company Site**
- Website/App Title: "Polaris Industries"
- URL: "polaris.com"
- URL 2: [empty]
- App URL: [empty]
- **Result**: Company = "Polaris Inc", Confidence = 95%

**Case 3: Subsidiary App**
- Website/App Title: "Indian Motorcycle"
- URL: [empty]
- URL 2: [empty]
- App URL: "com.polaris.indianmotorcycle"
- **Result**: Company = "Indian Motorcycle", Parent = "Polaris Inc"

## Success Criteria

1. Uses ONLY the 4 specified columns
2. Successfully identifies companies from all data types
3. Handles dealer/distributor relationships
4. Maintains parent-subsidiary mappings
5. Achieves 95%+ accuracy on test data

## Critical Reminders

1. **This corrects a specification failure** - previous spec was too vague
2. **Column names are sacred** - use exactly as specified
3. **The Aixam example is your test** - if you can identify Aixam from the dealer site, you're on track
4. **Domain expertise is encoded in column selection** - trust it

## Verification Steps

Each agent should verify:
1. Found all 4 required columns by name
2. No other columns used for company identification
3. Aixam example produces correct result
4. Parent-subsidiary relationships maintained

## Why This Matters

Alex spent WEEKS manually identifying companies from these specific columns. This domain expertise about which columns contain the relevant data is the foundation of BrandFontsIQ's value proposition. Respecting this expertise through precise implementation is critical.

---

*"In specifications, precision is not pedantry - it's preservation of hard-won domain knowledge."*