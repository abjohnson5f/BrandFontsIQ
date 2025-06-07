# BrandFontsIQ Tools

All scripts are in the `tools/` directory with symlinks from the project root for easy access.

## 🎯 Core Tools (5 scripts)

### Monitoring
- **`monitor.sh`** - Real-time sprint monitoring
  ```bash
  ./monitor.sh  # Shows live agent progress
  ```

- **`status.sh`** - Sprint status (quick or detailed)
  ```bash
  ./status.sh              # Quick one-line status
  ./status.sh --detailed   # Full detailed report
  ```

### Sprint Management
- **`sprint-plan.sh`** - Plan new sprints
  ```bash
  ./sprint-plan.sh         # Interactive planning
  ./sprint-plan.sh --next  # Quick next sprint info
  ```

- **`sprint-prepare.sh`** - Prepare sprint execution
  ```bash
  ./sprint-prepare.sh 3 smart-defaults  # Prepare sprint 3
  ```

- **`sprint-rerun.sh`** - Reset and retry current sprint
  ```bash
  ./sprint-rerun.sh  # Complete fresh start (3-second delay)
  ```

## 📋 Complete Sprint Workflow

### 1. Planning
```bash
./sprint-plan.sh         # See what's next and plan
```

### 2. Preparation
```bash
./sprint-prepare.sh 3 smart-defaults  # Creates guide
```

### 3. Execution (in Claude)
```
/simple-init-parallel smart-defaults
/exe-parallel-enhanced specs/sprint-03-smart-defaults.md 3
```

### 4. Monitoring
```bash
./monitor.sh     # Real-time in one terminal
./status.sh      # Quick check in another
```

### 5. Evaluation
```bash
./status.sh --detailed  # Review all implementations
# Then manually compare RESULTS.md files
```

### 6. Reset if Needed
```bash
./sprint-rerun.sh  # Complete fresh start
```

## 🛡️ Safety Features

- **Dynamic Detection**: All scripts auto-detect current sprint
- **No Hardcoding**: Works with any feature naming
- **Spec Protection**: Sprint specs are NEVER deleted
- **Clear Warnings**: Scripts show what they'll do before doing it

## 📝 Script Details

### monitor.sh
- Updates every 2 seconds
- Shows agent status (setup/working/complete)
- Displays file count for active agents
- Shows system info

### status.sh
- Two modes: quick (default) and detailed (--detailed)
- Quick: One-line summary with completion times
- Detailed: Full report with recent activity, file counts

### sprint-plan.sh
- Interactive planning mode (default)
- Quick next sprint info (--next)
- Copies existing plans or helps create new ones
- Shows business priorities

### sprint-prepare.sh
- Creates personalized execution guide
- Cleans up previous sprint debris
- Checks for specification
- Provides step-by-step instructions

### sprint-rerun.sh
- Complete reset of current sprint
- 3-second countdown (Ctrl+C to cancel)
- Removes worktrees, branches, guides
- Preserves specs and main branch

## 🚫 What We Removed

Deleted during cleanup:
- `agents-quick.sh` - Hardcoded feature names
- `exe-parallel-safe.sh` - Functionality moved to command
- `next-sprint.sh` - Merged into sprint-plan.sh
- `parse-task-logs.sh` - Rarely used verbose log parser
- `agents-detailed.sh` - Merged into status.sh --detailed

## 📁 Directory Structure

```
tools/
├── README.md          (this file)
├── monitor.sh         (real-time monitoring)
├── status.sh          (quick & detailed status)
├── sprint-plan.sh     (planning new sprints)
├── sprint-prepare.sh  (sprint preparation)
└── sprint-rerun.sh    (reset current sprint)

project-root/
├── monitor.sh -> tools/monitor.sh
├── status.sh -> tools/status.sh
├── sprint-plan.sh -> tools/sprint-plan.sh
├── sprint-prepare.sh -> tools/sprint-prepare.sh
└── sprint-rerun.sh -> tools/sprint-rerun.sh
```

All scripts in root are symlinks to tools/ for convenience.