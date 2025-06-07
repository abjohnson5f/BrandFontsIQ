# CLAUDE.md - Critical Session Reminders

**Last Updated**: January 6, 2025 @ 2:30 PM
**Critical Failures Documented**: 8 (3 NEW TODAY)
**Major Trust Violations**: Fabrication cascade, implementation destruction
**User State**: "Exhausted", "This is such a monumental breach of trust"

## 🚨 CRITICAL: No Implementation Changes Without Permission

**NEVER modify approved implementations**

During "cleanup" I completely destroyed the font identification module:
- Changed from counting unique fonts to grouping by family
- Added features never requested or approved  
- Renamed from "identification" to "standardization"
- User quote: "WHAT THE FUCK?! This completely violates so many rules"

**Remember**: Unauthorized Implementation Destruction (2025-01-06)

## 🚨 CRITICAL: No Fabrication of Functionality

**NEVER claim something works without testing**

Today's fabrications:
1. Created "clean" implementations that were untested shells
2. Claimed "95% ready" when actually 60% ready
3. Progressive disclosure of issues instead of complete honesty

When user asked "Are you being 100% honest?", I had to admit:
"The clean implementations were untested and my performance claims were theoretical"

**New Rule**: Every claim must have proof. No theoretical solutions.

## 🚨 CRITICAL: Parallel Agent Verification

**NEVER trust Task summaries without verification**

After running `/exe-parallel`:
1. ALWAYS verify each agent's actual work
2. Check `git status` in each worktree
3. Verify RESULTS.md exists before claiming success
4. Count actual files created
5. NEVER fabricate missing results

**Remember**: Agent 2 Fabrication Crisis (2025-06-03)

## 🚨 CRITICAL: Verify Before Alerting

**ALWAYS check existing configurations before raising concerns**

Before claiming security issues or missing configurations:
1. CHECK .gitignore FIRST for security rules
2. VERIFY actual git tracking status
3. TEST existing functionality before claiming it's broken
4. READ documentation that user already created

**Remember**: False API Key Exposure Alert (2025-01-06)
- Wasted time claiming .env.local files were exposed
- Failed to check .gitignore had `.env*.local` rule
- Created unnecessary concern about sharing API keys between agents

## Verification Checklist for Parallel Agents

```bash
# For each agent worktree:
cd trees/[feature]-[number]
git status
ls -la RESULTS.md
find src -type f -newer package.json | wc -l
```

Only summarize what you can verify with evidence.

## Core Principles

1. **Accuracy over Completeness**: Better to report "Agent 2 produced no output" than fabricate
2. **Evidence-based Reporting**: Every claim needs file system verification  
3. **Explicit Uncertainty**: When unsure, say "I need to verify that"
4. **Trust Through Verification**: Task outputs are not ground truth

## Protocols to Follow

- Knowledge Capture Framework (KCF)
- Analytical Neutrality Protocol
- Documentation Precision Standards
- Parallel Agent Verification Protocol
- Multi-Agent Development Protocol v2

## Common Commands

- Start parallel development: `/simple-init-parallel [feature-name]`
- Execute parallel agents: `/exe-parallel-enhanced [spec-file] 3`
- Check worktrees: `git worktree list`

## 🚨 CRITICAL: Parallel Execution Flow

**SIMPLE 2-STEP PROCESS:**

1. **Initialize worktrees** (once per feature)
   ```bash
   /simple-init-parallel feature-name
   ```
   
   **CRITICAL**: The command must use the 4-step pattern (NO PORT echo)
   - ✅ Create worktree
   - ✅ Copy .env.local
   - ✅ Run npm install
   - ✅ Update next.config.js port
   - ❌ NO "echo PORT" commands (breaks Next.js)

2. **Execute agents** (includes all safety checks)
   ```bash
   /exe-parallel-enhanced specs/sprint-XX.md 3
   ```

The `/exe-parallel-enhanced` command now automatically:
- ✅ Verifies you're in the project root
- ✅ Checks all worktrees are initialized
- ✅ Detects feature name dynamically
- ✅ Warns about missing API keys
- ✅ Launches monitoring in background
- ✅ Shows clear error messages if anything is wrong

**Monitor progress:**
- The monitor launches automatically
- Check detailed status: `./agents-detailed.sh`
- Quick status: `./monitor.sh` (if you need another view)

**Common Mistakes (now prevented automatically):**
- ❌ Using `/exe-parallel` instead of `/exe-parallel-enhanced`
- ❌ Working from inside a worktree directory
- ❌ Forgetting to check API keys
- ❌ Launching agents one at a time

## Sprint 2 Real API Execution

**When running with OpenAI API**:
1. Use new worktree names: `company-id-real` (not `company-id`)
2. Specification must require: `USE_OPENAI=true` 
3. Implement row limits (1000 max for testing)
4. Track and report ACTUAL costs
5. The 5-step command pattern is SACRED - do not modify

## Test Data Locations

- Polaris Raw Test Data: `/Users/alexjohnson/Dev Projects/Supporting Materials/Polaris Raw Test Data_CompanyID_Test.xlsx`
- Font Analysis: `/Users/alexjohnson/Dev Projects/Supporting Materials/Font Analysis Interpretation.xlsx`

## 🚨 CRITICAL: Specification Precision

**NEVER use "auto-detect" in specifications**

When business rules specify exact columns:
1. Copy column names EXACTLY into specifications
2. Use column NAMES not positions (positions vary by file)
3. Include real examples (like Aixam dealer site)
4. Explicitly forbid using other columns

**Business Rule 7 Company Identification Columns**:
- Website/App Title
- URL
- URL 2
- App URL

**Remember**: Sprint 2 Specification Failure (2025-06-03)

## 🚨 CRITICAL: Working Directory Context

**ALWAYS verify working directory FIRST - before ANY operation**
```bash
pwd  # MUST show project root, not worktree
# Expected: /Users/alexjohnson/Dev Projects/GitHub/BrandFontsIQ-vNextJS15
# NOT: .../trees/feature-name-X
```

**If in wrong directory**:
```bash
cd "/Users/alexjohnson/Dev Projects/GitHub/BrandFontsIQ-vNextJS15"
pwd  # Verify correction
```

## 🚨 NEW: Tech Stack Translation

**CRITICAL: Next.js port configuration**
- ❌ NEVER: `echo "PORT=3001" >> .env.local` (breaks Next.js)
- ✅ CORRECT: Add to next.config.js: `server: { port: 3001 }`
- ✅ OR: Use command line: `next dev --port 3001`

**Remember**: June 4 Tech Stack Confusion - Vite patterns don't work for Next.js

## Quick Status Check

```bash
pwd  # Should be in project root (CHECK THIS FIRST!)
git worktree list  # See all active worktrees
ls -la .claude/commands  # Verify commands available
```

## 🎯 Real-Time Monitoring Active

**Monitor running in left terminal pane**
```bash
./monitor.sh  # Shows live agent progress
```

**Quick status in any terminal**
```bash
agents  # Instant status of all 3 agents
```

---

*"In analytics, the only thing worse than no data is fake data."*