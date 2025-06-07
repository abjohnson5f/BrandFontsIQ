# Script Audit - June 5, 2025

## Issues Found

### 1. Hardcoded Feature Names
**Problem**: Multiple scripts still have hardcoded feature names
- `agents-quick.sh`: Hardcoded to "company-id-correct"
- Should use dynamic detection like agents-detailed.sh

### 2. Duplicate Functionality
**Monitoring Scripts** (3 scripts doing similar things):
- `monitor.sh` - Real-time monitoring
- `agents-detailed.sh` - Detailed status
- `agents-quick.sh` - Quick status (but hardcoded)

**Sprint Management** (overlapping functionality):
- `exe-parallel-safe.sh` - Seems to duplicate exe-parallel-enhanced command
- `plan-sprint.sh` & `next-sprint.sh` - Both help with sprint planning

### 3. Unclear Purpose
- `scripts/parse-task-logs.sh` - What logs? When to use?
- `scripts/Dev/` directory - What's in there?

### 4. Naming Inconsistencies
- Some use hyphens: `agents-detailed.sh`
- Some use underscores in functionality
- Mix of verb-first and noun-first naming

## Recommendations

### 1. Consolidate Monitoring
Merge into two scripts:
- `monitor.sh` - Real-time monitoring (keep as-is)
- `status.sh` - Combined quick/detailed status with flags
  - `./status.sh` - Quick one-line
  - `./status.sh --detailed` - Full details

### 2. Remove Duplicates
- Delete `exe-parallel-safe.sh` (functionality moved to command)
- Merge `next-sprint.sh` into `plan-sprint.sh`
- Fix or remove `agents-quick.sh`

### 3. Fix Hardcoding
Update all scripts to use dynamic feature detection

### 4. Clear Naming Convention
Adopt consistent naming:
- `sprint-*` for sprint management
- `monitor-*` for monitoring
- Use hyphens, not underscores

### 5. Add Script Documentation
Create `tools/README.md` explaining:
- What each script does
- When to use it
- Examples

## Proposed New Structure

```
tools/
├── README.md
├── monitoring/
│   ├── monitor.sh (real-time)
│   └── status.sh (quick & detailed)
└── sprint-management/
    ├── sprint-plan.sh (plan new sprints)
    ├── sprint-prepare.sh (prepare execution)
    ├── sprint-rerun.sh (reset and retry)
    └── sprint-eval.sh (evaluate results)
```