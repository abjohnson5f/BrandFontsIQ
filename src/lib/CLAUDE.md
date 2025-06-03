# Calculation Engine Library

## 🎯 Purpose
Core business logic for font analysis and metrics calculation.

## 🔑 Key Principles

### 1. NO HARDCODED VALUES
```typescript
// ❌ NEVER DO THIS
const DEFAULT_REVENUE = 500000000; // NO!

// ✅ DO THIS
const getDefaultRevenue = () => {
  return config.smartDefaults.revenue.baseline;
};
```

### 2. Font Uniqueness Rules
```typescript
// Remember: Weight + Style = Unique Font
function generateFontId(name: string, weight: string, style: string): string {
  return `${standardize(name)}_${weight}_${style}`;
}
```

### 3. Forensic Attribution
Every calculation MUST return:
- The computed value
- The formula used
- All input values
- Timestamp and traceId

## 📁 File Structure
```
/src/lib/
├── fonts/
│   ├── standardization.ts    # Name cleaning
│   ├── parser.ts            # Weight/style extraction
│   └── validation.ts        # Rule enforcement
├── calculations/
│   ├── engine.ts           # Core calculator
│   ├── formulas.ts         # Formula definitions
│   └── attribution.ts      # Forensic tracking
└── enrichment/
    ├── company.ts          # LLM company ID
    └── anatomy.ts          # Font metadata
```

## 🚀 Current Sprint Focus
- Font standardization for 205 unique fonts
- Weight/style parsing accuracy
- Binary success validation

## ⚠️ Common Mistakes
1. Treating "Arial Bold" same as "Arial"
2. Hardcoding font lists
3. Missing forensic attribution
4. Forgetting case sensitivity

---
*lib/ Directory Guide*