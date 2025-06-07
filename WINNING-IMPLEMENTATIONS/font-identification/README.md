# Font Identification Module

## Overview
This module accurately identifies unique fonts from Excel data using conservative standardization to avoid over-consolidation.

## Core Purpose
- **Identify unique fonts** - The primary goal
- **Standardize names** - Conservative approach to avoid over-consolidation
- **Parse components** - For FUTURE font anatomy enrichment (Sprint 4)

## Key Features
- ✅ Accurate unique font identification
- ✅ Conservative standardization (preserves distinctions)
- ✅ Multiple column detection strategies
- ✅ Configuration-based rules (NO hardcoded values)
- ✅ Component parsing for future analysis

## Usage

```typescript
import { processExcelFile, identifyUniqueFonts } from './source-code';

// Process Excel file
const summary = await processExcelFile('polaris_fonts.xlsx');

console.log(`Unique fonts found: ${summary.uniqueCount}`);
console.log(`Total rows processed: ${summary.totalRows}`);

// Or process data array directly
const data = [/* Excel rows */];
const summary = identifyUniqueFonts(data);
```

## Configuration

Edit `../configuration.json`:

```json
{
  "fontStandardization": {
    "standardizationMap": {
      "Gotham SSm": "Gotham Screen Smart",
      "GothamSSm": "Gotham Screen Smart",
      "Bd": "Bold",
      "Lt": "Light",
      "SemiBold": "Semi-Bold"
    }
  }
}
```

## Identification Strategy

1. **Font Name Column** - Looks for 'Font Name', 'FontName', etc.
2. **File Path** - Extracts from font file paths
3. **Other Columns** - Intelligent detection from any text column
4. **Family + Subfamily** - Combines when separate

## Component Parsing (For Future Use)

The module parses components but DOES NOT use them for grouping:

```typescript
"Arial Bold Italic" → {
  baseName: "Arial",
  weight: "Bold",
  style: "Italic",
  width: null
}
```

This is preparation for Sprint 4 font anatomy features.

## Critical Implementation Details
1. **Conservative Standardization** - Doesn't over-combine fonts
2. **Preserves Distinctions** - Bold vs Regular are separate
3. **Accurate Counting** - Each dataset's actual unique fonts
4. **No Family Grouping** - That's NOT what this does

## Testing
```bash
# Verify font count
npx tsx test-font-count.ts
# Compares against your expected count for the dataset
```

## What This Does NOT Do
- ❌ Group by font family
- ❌ Analyze font relationships
- ❌ Export enriched files
- ❌ Anything beyond counting unique fonts accurately

## Original Implementation
This is the EXACT implementation from the winning Agent 1 + Agent 2 hybrid approach, with only hardcoded values moved to configuration.