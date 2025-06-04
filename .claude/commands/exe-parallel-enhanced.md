# Enhanced Parallel Task Execution

## Variables
PLAN_TO_EXECUTE: $ARGUMENTS
NUMBER_OF_PARALLEL_WORKTREES: $ARGUMENTS

## Pre-execution Setup
RUN `clear`
RUN `echo "🚀 PARALLEL AGENT EXECUTION STARTING 🚀"`
RUN `echo "================================================"`
RUN `echo "📋 Specification: $PLAN_TO_EXECUTE"`
RUN `echo "🔢 Parallel Agents: $NUMBER_OF_PARALLEL_WORKTREES"`
RUN `echo "================================================"`

## Show Current State
RUN `echo "\n📁 Current worktrees:"`
RUN `git worktree list | grep -E "company-id-real-[0-9]" || echo "No existing worktrees"`

## Launch Monitoring Script
Create a monitoring script that runs in the background:

```bash
cat > /tmp/monitor-agents.sh << 'EOF'
#!/usr/bin/env zsh
feature_name=$(echo "$1" | sed 's/.*sprint-[0-9]*-//' | sed 's/\.md$//')

while true; do
  echo -e "\033[2J\033[H"  # Clear screen and move to top
  echo "🚀 PARALLEL AGENT MONITOR - $(date +%H:%M:%S)"
  echo "================================================"
  
  for i in {1..3}; do
    tree="trees/${feature_name}-${i}"
    echo -n "Agent $i: "
    
    if [[ -f "$tree/RESULTS.md" ]]; then
      echo "✅ COMPLETE"
    elif [[ -d "$tree" ]]; then
      changes=$(cd "$tree" 2>/dev/null && git status --porcelain | wc -l | tr -d ' ')
      echo "🔄 WORKING ($changes changes)"
    else
      echo "⏳ PENDING"
    fi
  done
  
  echo "\n📊 Quick Stats:"
  echo "Active Node processes: $(pgrep -f node | wc -l | tr -d ' ')"
  echo "Total CPU usage: $(ps aux | awk '{sum+=$3} END {printf "%.1f%%", sum}')"
  
  sleep 3
done
EOF

chmod +x /tmp/monitor-agents.sh
```

RUN `/tmp/monitor-agents.sh "$PLAN_TO_EXECUTE" &`
RUN `MONITOR_PID=$!`

## Read Specification
READ: PLAN_TO_EXECUTE

## Instructions

We're going to create NUMBER_OF_PARALLEL_WORKTREES new subagents that use the Task tool to create N versions of the same feature in parallel.

IMPORTANT: For maximum visibility in Cursor's terminal:
1. Each agent will output progress markers
2. We'll use clear status indicators
3. Terminal will show real-time updates

The agents will work in:
- trees/<feature_name>-1/
- trees/<feature_name>-2/
- trees/<feature_name>-3/

## Launch Agents with Enhanced Output

For each agent, we'll:
1. Show clear start messages
2. Track progress in real-time
3. Output to both terminal and log files

Each agent will:
- Create a log file in their worktree
- Update status in RESULTS.md incrementally
- Show progress in terminal

## Post-Execution Summary

After all agents complete:
1. Kill the monitor script
2. Show summary of results
3. Highlight which implementation performed best

RUN `echo "\n✨ Launching parallel agents now..."`