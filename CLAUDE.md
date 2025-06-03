# BrandFontsIQ Core Knowledge

## 🚨 IMMUTABLE BUSINESS RULES (NEVER VIOLATE)

### Rule 2: Font Uniqueness
- **Each weight/style is a SEPARATE font**
- Arial Regular ≠ Arial Bold ≠ Arial Italic
- Example: "Arial" family with 4 weights = 4 unique fonts

### Rule 6: Font Source Detection
- Font sources are split across TWO columns:
  - **Remarks column**: Contains source info
  - **Unique ID column**: Also contains source info
- Must check BOTH columns to identify font source

### Rule 7: Company Identification
- Manual process takes WEEKS
- **MUST automate with LLM** - this is a key differentiator
- Company names are buried in unstructured data

### Rule 8: Absolute Data Integrity
- **NO HARDCODED VALUES - EVER**
- Every calculation must trace to real data
- Show calculation steps transparently

### Rule 10: Enterprise Scale
- Must handle **25,000+ rows**
- Enrichment happens FIRST (company ID, font anatomy)
- Then calculations run on enriched data

### Rule 11: Smart Defaults
- **$500M revenue baseline** when unknown
- Always show it's a default with transparency
- Enables 80% immediate value without sensitive data

### Rule 12: Privacy Through Intelligence
- Never ask for sensitive financial data
- Use smart defaults and ranges instead
- Speed to value over perfect accuracy initially

## 🎯 CRITICAL PROTOCOLS

### Obsidian-First Protocol (IMMUTABLE)
- **ALL strategic analysis → Obsidian vault FIRST**
- **ALL research synthesis → Obsidian vault FIRST**
- **ALL decisions → Obsidian vault FIRST**
- Code goes in repo, knowledge goes in vault

### Multi-Agent Development Protocol v2.0
- Use `/simple-init-parallel [FEATURE_NAME]` to create worktrees
- Use `/exe-parallel [SPEC_FILE] [AGENT_COUNT]` to execute
- **Binary success criteria required** - no approximations
- 3 parallel agents work independently on same problem

### Knowledge Capture Framework (KCF)
- Phase 1: Raw extraction → `/research/`
- Phase 2: Initial analysis → `/business-context/analytical-syntheses/`
- Phase 3: Strategic insight → `/business-context/strategic-insights/`
- Phase 4: Forward implications → `/business-context/forward-implications/`

## 🏃 CURRENT SPRINT: Unique Font Identification

### Sprint 1 Target
- **EXACTLY 205 unique fonts** from Polaris test data
- Binary success - hit 205 or fail
- Keep ALL 2,135 rows
- Standardize names but PRESERVE weight/style distinctions

### Test Data Location
- `/Users/alexjohnson/Supporting Materials/Polaris Raw Test Data.xlsx`
- Column B: Font names with weights/styles
- Remember: "Arial Bold" ≠ "Arial Regular"

## 🏗️ ARCHITECTURE DECISIONS

### Dashboard-as-Universe Model
- Each dashboard = **completely isolated environment**
- One dashboard per corporate entity
- **NO cross-dashboard data sharing EVER**
- Multi-tenant but with absolute data isolation

### Calculation Engine Principles
- **Single source of truth** pattern
- Full calculation transparency
- Pattern-based solutions only
- External configuration for everything
- Forensic attribution (trace every number)

## 📍 KEY PATHS

### Obsidian Vault
- `/Users/alexjohnson/Dev Projects/BrandFontsIQ/`

### Active Work
- `📌 ACTIVE/NEXT-ACTIONS.md` - Immediate tasks
- `📌 ACTIVE/blockers/` - Current blockers
- `📌 ACTIVE/current-sprint/` - Sprint details

### Implementation Guides
- `/implementation-guides/sprint-plans/sprint-01-unique-font-identification-CORRECTED.md`
- `/implementation-guides/critical-business-rules-quick-reference.md`
- `/implementation-guides/multi-agent-development-quick-reference.md`

## 🔑 DOMAIN INSIGHTS

### The Typography Value Gap
- Enterprises don't measure typography's business impact
- No tools exist to quantify font performance
- BrandFontsIQ fills this measurement gap

### Complexity is the Moat
- **Don't simplify** - complexity exists for business reasons
- Font management IS complex (legal, technical, financial)
- Our sophistication in handling complexity = competitive advantage

### Trust Equation
- **Count Accuracy × Calculation Quality = Trust**
- Both must be perfect (multiplicative, not additive)
- One error in counting → zero trust

## ⚡ QUICK COMMANDS

```bash
# Start parallel development
/simple-init-parallel unique-fonts

# Execute parallel agents
/exe-parallel sprint-01-spec.md 3

# Check current status
cat "📌 ACTIVE/NEXT-ACTIONS.md"

# View business rules
cat "/business-context/immutable-facts/business-rules-master-list.md"
```

## 🚫 NEVER DO THIS

1. Create files without checking if they exist first
2. Hardcode values in calculations
3. Treat different font weights as the same font
4. Share data between dashboards
5. Skip writing findings to Obsidian vault
6. Make decisions without binary success criteria
7. Abstract or summarize when precision is needed

---
*Last Updated: 2025-06-02*
*Source: BrandFontsIQ Obsidian Vault Analysis*