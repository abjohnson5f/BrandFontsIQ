# Font Standardization - Implementation Files

## Primary Implementation Location

### Core Implementation
```
/Users/alexjohnson/Dev Projects/GitHub/BrandFontsIQ-vNextJS15/src/lib/fontIdentification.ts
```

### Additional Copies (in agent worktrees)
```
/Users/alexjohnson/Dev Projects/GitHub/BrandFontsIQ-vNextJS15/trees/company_id_v3-1/src/lib/fontIdentification.ts
/Users/alexjohnson/Dev Projects/GitHub/BrandFontsIQ-vNextJS15/trees/company_id_v3-2/src/lib/fontIdentification.ts
/Users/alexjohnson/Dev Projects/GitHub/BrandFontsIQ-vNextJS15/trees/company_id_v3-3/src/lib/fontIdentification.ts
```

## Related Documentation

### Implementation Guides
```
/Users/alexjohnson/Dev Projects/BrandFontsIQ/implementation-guides/font-standardization-implementation.md
/Users/alexjohnson/Dev Projects/BrandFontsIQ/implementation-guides/font-standardization-guide.md
/Users/alexjohnson/Dev Projects/BrandFontsIQ/implementation-guides/unique-font-counting-test-specification.md
```

### Session Results
```
/Users/alexjohnson/Dev Projects/BrandFontsIQ/📝 SESSION-LOGS/HYBRID_IMPLEMENTATION_RESULTS.md
```

## Key Functions in fontIdentification.ts

- `identifyUniqueFont()` - Main standardization logic
- `standardizeFontName()` - Applies mapping rules
- `parseFontComponents()` - Extracts font anatomy
- `extractFontFromPath()` - Fallback identification

## How to Test

```bash
# Navigate to any implementation
cd /Users/alexjohnson/Dev Projects/GitHub/BrandFontsIQ-vNextJS15

# View the implementation
cat src/lib/fontIdentification.ts

# The font identification is integrated into the company identification scripts
# See it in action in any of the agent implementations
```

## Critical Implementation Details

1. **Hierarchy**: Font Name → Path → Metadata → Family+Subfamily
2. **Standardization**: Maps common abbreviations (SSm, Bd, Lt, etc.)
3. **Preservation**: Maintains weight/style distinctions
4. **Future-Ready**: Includes component parsing for font anatomy