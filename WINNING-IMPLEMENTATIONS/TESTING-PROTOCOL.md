# Testing & Enhancement Protocol for Winning Implementations

## 🚨 CRITICAL: Immutable Testing Rules

### 1. **NEVER Modify Without Testing**
- Run existing tests FIRST to establish baseline
- Make changes in a separate file (e.g., `index-enhanced.ts`)
- Test the enhancement
- Only replace original after proving improvement

### 2. **Environment Setup**
```bash
# ALWAYS load environment variables
source .env.local
# OR use dotenv in tests
require('dotenv').config({ path: '.env.local' });
```

### 3. **Performance Baselines**
**Company Identification (Agent 3's proven performance):**
- Dataset: Polaris Raw Test Data
- Rows: 2,135
- Success Rate: 99%
- Time: 29 minutes
- Cost: $7.69

**Any enhancement MUST meet or exceed these metrics**

### 4. **Critical Test Cases**
These MUST pass for any change to be valid:

1. **Aixam Dealer Test**
   - URL: `abb-vsp.com`
   - Expected: Aixam (NOT the dealer)
   - Why: Tests LLM's ability to visit site and identify manufacturer

2. **International URLs**
   - `peanutbutter.mx` → Skippy
   - `peanutbutter.id` → Skippy
   - Why: Tests cross-domain intelligence

3. **FTP Subdomains**
   - `ftp.applegate.com` → Applegate
   - Why: Tests subdomain handling

4. **Heritage Test**
   - `heritageimc.com` → Heritage Premium Meats (NOT insurance)
   - Why: Tests context over assumptions

## 🔬 Standard Testing Process

### Step 1: Baseline Test
```bash
cd WINNING-IMPLEMENTATIONS/company-identification
npx tsx test-baseline.ts
```
Record: Success rate, time, specific failures

### Step 2: Enhancement Development
- Create `source-code/index-enhanced.ts`
- Implement changes
- Keep original `index.ts` untouched

### Step 3: Comparative Testing
```bash
npx tsx test-enhanced.ts
```
Must show:
- Same or better success rate
- Same or better performance
- All critical cases pass

### Step 4: Regression Testing
Test with multiple datasets:
- Hormel Foods data
- Polaris data  
- Edge cases collection

### Step 5: Documentation
Document in `enhancement-log.md`:
- What changed
- Why it changed
- Test results comparison
- Any trade-offs

## 🛑 When to STOP

STOP if:
- Success rate drops below baseline
- Performance degrades
- Critical test cases fail
- Can't explain why original worked

## 📋 Pre-Enhancement Checklist

- [ ] Located and loaded `.env.local`
- [ ] Read original implementation completely
- [ ] Understood WHY it works
- [ ] Identified specific improvement goal
- [ ] Created test data for that goal
- [ ] Baseline metrics recorded

## 🔍 Debugging Protocol

When something isn't working:

1. **Check environment first**
   ```bash
   echo $OPENAI_API_KEY
   ```

2. **Run minimal test**
   ```javascript
   // Test API connectivity
   const result = await identifyCompany({
     websiteAppTitle: 'Hormel Foods',
     url: 'hormelfoods.com',
     url2: '',
     appUrl: ''
   });
   console.log(result);
   ```

3. **Check rate limits**
   - Batch size
   - Concurrency
   - Delays between calls

4. **Verify data format**
   - Column mappings
   - Data types
   - Required fields

## ⚠️ What We've Learned

1. **The winning implementation works** - don't break it
2. **Test everything** - claims without evidence waste time
3. **Preserve specifications** - they contain critical requirements
4. **Environment matters** - always verify API access
5. **Small changes only** - big rewrites = big risks

---

*"The winning implementation already solves the problem. Enhance carefully."*