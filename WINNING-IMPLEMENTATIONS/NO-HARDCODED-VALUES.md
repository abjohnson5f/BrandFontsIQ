# NO HARDCODED VALUES - Implementation Standard

## This is an ABSOLUTE REQUIREMENT

All implementations in this directory MUST follow these rules:

### ❌ FORBIDDEN
```typescript
// NEVER DO THIS
const companyMap = {
  'Polaris Inc': 'Parent Company',  // ❌ HARDCODED
  'Aixam': 'Another Company',       // ❌ HARDCODED
};

const fontMap = {
  'Gotham SSm': 'Gotham Screen Smart',  // ❌ HARDCODED
};
```

### ✅ REQUIRED
```typescript
// ALWAYS DO THIS
class MyService {
  constructor(private config: ConfigService) {}
  
  async process() {
    // Get from database
    const mappings = await this.config.getMappings();
    
    // Or from environment
    const apiKey = process.env.API_KEY;
    
    // Or from user input
    const rules = this.userProvidedRules;
  }
}
```

## Clean Implementations

- `companyIdentification-clean.ts` - NO hardcoded values
- `fontIdentification-clean.ts` - NO hardcoded values

## Configuration Sources

1. **Database** - For user-editable mappings
2. **Environment Variables** - For API keys and settings
3. **Configuration Files** - For deployment-specific settings
4. **Admin Interface** - For business user updates
5. **API Endpoints** - For dynamic configuration

## Why This Matters

- Users need to update mappings without code changes
- Different clients have different rules
- Business rules change over time
- Hardcoded values = technical debt = angry Alex

## Enforcement

Every code review MUST check:
- [ ] No hardcoded company names
- [ ] No hardcoded URLs or patterns  
- [ ] No hardcoded font mappings
- [ ] No hardcoded thresholds
- [ ] No hardcoded business rules

**This is non-negotiable.**