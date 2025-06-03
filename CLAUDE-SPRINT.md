# Sprint 1: Unique Font Identification

## 🎯 Sprint Goal
**EXACTLY 205 unique fonts** from Polaris test data

## ✅ Success Criteria (BINARY)
- [ ] Algorithm identifies EXACTLY 205 unique fonts
- [ ] All 2,135 rows preserved with font assignments
- [ ] Font standardization works correctly
- [ ] Weight/style distinctions preserved
- [ ] Test passes with Polaris Raw Test Data.xlsx

## 📊 Test Data
- **File**: `/Users/alexjohnson/Supporting Materials/Polaris Raw Test Data.xlsx`
- **Total Rows**: 2,135
- **Expected Unique Fonts**: 205
- **Key Column**: B (Font names with weights/styles)

## 🔧 Implementation Approach

### Step 1: Font Name Standardization
- Remove inconsistencies (spaces, special characters)
- Normalize case
- BUT preserve weight/style indicators

### Step 2: Weight/Style Detection
- Identify weight keywords: Regular, Bold, Light, Medium, Heavy, Black
- Identify style keywords: Italic, Oblique, Condensed, Extended
- Create unique key: `{StandardizedName}_{Weight}_{Style}`

### Step 3: Validation
```typescript
// Expected output structure
{
  uniqueFonts: Set<string>, // Size MUST be 205
  fontMapping: Map<rowIndex, uniqueFontId>,
  standardizationLog: Array<{original, standardized, uniqueId}>
}
```

## 📍 Current Status

### Completed
- [x] Repository initialized
- [x] Parallel worktrees created
- [x] Project structure established

### In Progress
- [ ] Font standardization algorithm
- [ ] Weight/style parsing logic
- [ ] Test harness creation

### Blocked
- None currently

## 🚀 Next Actions
1. Implement `standardizeFontName()` function
2. Create `extractWeightAndStyle()` parser
3. Build `generateUniqueFontId()` logic
4. Write test suite with Polaris data
5. Validate exactly 205 unique fonts

## 📝 Key Files to Create/Modify
- `/src/lib/fontStandardization.ts` - Core algorithm
- `/src/lib/fontParser.ts` - Weight/style extraction
- `/src/tests/uniqueFontCount.test.ts` - Validation tests
- `/scripts/validatePolaris.ts` - One-shot validator

## ⚠️ Common Pitfalls to Avoid
1. **Don't combine weights**: "Arial Bold" ≠ "Arial Regular"
2. **Watch for variants**: "Arial", "Arial MT", "Arial Unicode MS" are different
3. **Preserve everything**: Even weird names like "????Text" (yes, really)
4. **Case sensitivity**: "ARIAL" vs "Arial" should map to same base font
5. **Spacing matters**: "Arial Black" vs "ArialBlack" need standardization

## 🔗 Related Documentation
- Sprint Spec: `/implementation-guides/sprint-plans/sprint-01-unique-font-identification-CORRECTED.md`
- Business Rules: `/business-context/immutable-facts/business-rules-master-list.md`
- Test Spec: `/implementation-guides/unique-font-counting-test-specification.md`

## 📅 Sprint Timeline
- **Start**: 2025-06-02
- **Target**: 48-hour completion
- **Hard Deadline**: Binary success by sprint end

## 🎉 Definition of Done
1. Function returns EXACTLY 205 unique fonts
2. All original rows maintained with assignments
3. Standardization is reversible (can trace back)
4. Performance handles 25,000+ rows
5. Full test coverage with Polaris data

---
*Sprint 1 - Active*
*Last Updated: 2025-06-02*