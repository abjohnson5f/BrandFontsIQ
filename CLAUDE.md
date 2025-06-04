# CLAUDE.md - Critical Session Reminders

**Last Updated**: June 4, 2025
**Critical Failures Documented**: 2
**Major Improvements**: Real-time monitoring system active

## 🚨 CRITICAL: Parallel Agent Verification

**NEVER trust Task summaries without verification**

After running `/exe-parallel`:
1. ALWAYS verify each agent's actual work
2. Check `git status` in each worktree
3. Verify RESULTS.md exists before claiming success
4. Count actual files created
5. NEVER fabricate missing results

**Remember**: Agent 2 Fabrication Crisis (2025-06-03)

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
- Execute parallel agents: `/exe-parallel [spec-file] 3`
- Check worktrees: `git worktree list`

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