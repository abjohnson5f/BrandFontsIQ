# Enhanced Parallel Task Execution with Safety Checks

## Variables
PLAN_TO_EXECUTE: $ARGUMENTS
NUMBER_OF_PARALLEL_WORKTREES: $ARGUMENTS

## Pre-execution Safety Checks
RUN `clear`
RUN `echo "🚀 PARALLEL AGENT EXECUTION STARTING 🚀"`
RUN `echo "================================================"`
RUN `echo "📋 Specification: $PLAN_TO_EXECUTE"`
RUN `echo "🔢 Parallel Agents: $NUMBER_OF_PARALLEL_WORKTREES"`
RUN `echo "================================================"`

## 1. Verify Working Directory
RUN `echo "\n🔍 Checking working directory..."`
RUN `pwd`
RUN `if [[ ! -f "package.json" ]] || [[ ! -d ".claude" ]]; then echo "❌ ERROR: Not in project root! Please cd to project root first."; exit 1; else echo "✅ Working directory verified"; fi`

## 2. Verify Specification File
RUN `if [[ ! -f "$PLAN_TO_EXECUTE" ]]; then echo "❌ ERROR: Specification file not found: $PLAN_TO_EXECUTE"; exit 1; else echo "✅ Specification file found"; fi`

## 3. Detect Feature Name from Worktrees
RUN `feature_pattern=$(ls -d trees/*-1 2>/dev/null | head -1 | sed 's|trees/||' | sed 's|-1$||')`
RUN `if [[ -z "$feature_pattern" ]]; then echo "❌ ERROR: No worktrees found! Run /simple-init-parallel <feature-name> first"; exit 1; else echo "✅ Feature detected: $feature_pattern"; fi`

## 4. Show Current Worktrees
RUN `echo "\n📁 Current worktrees:"`
RUN `git worktree list | grep -E "trees/${feature_pattern}-[0-9]" || echo "No matching worktrees"`

## 5. Verify All Worktrees Ready
RUN `echo "\n🔍 Verifying worktrees..."`
RUN `all_ready=true; for i in $(seq 1 $NUMBER_OF_PARALLEL_WORKTREES); do dir="trees/${feature_pattern}-${i}"; echo -n "  Agent $i: "; if [[ ! -d "$dir" ]]; then echo "❌ Missing"; all_ready=false; elif [[ ! -f "$dir/package.json" ]]; then echo "❌ Not initialized"; all_ready=false; else echo "✅ Ready"; fi; done; if [[ "$all_ready" != "true" ]]; then echo "\n❌ ERROR: Not all worktrees ready. Run /simple-init-parallel ${feature_pattern} first"; exit 1; fi`

## 6. Check for API Key if Needed
RUN `if grep -q "OPENAI\|GPT\|LLM" "$PLAN_TO_EXECUTE" 2>/dev/null; then echo "\n🔑 Checking API keys..."; if [[ -z "$OPENAI_API_KEY" ]]; then echo "⚠️  WARNING: OpenAI API key not set. Agents may fail if they need API access."; echo "   To set: export OPENAI_API_KEY='your-key-here'"; else echo "✅ OpenAI API key found"; fi; fi`

## 7. Launch Background Monitor
RUN `echo "\n🖥️  Launching background monitor..."`
RUN `./monitor.sh > /tmp/monitor-output.log 2>&1 &`
RUN `MONITOR_PID=$!`
RUN `echo "Monitor PID: $MONITOR_PID"`

## 8. Display Summary
RUN `echo "\n================================================"`
RUN `echo "📋 READY TO LAUNCH AGENTS"`
RUN `echo "================================================"`
RUN `echo "Feature: $feature_pattern"`
RUN `echo "Specification: $PLAN_TO_EXECUTE"`
RUN `echo "Agents: $NUMBER_OF_PARALLEL_WORKTREES"`
RUN `echo "Monitor: Running (PID $MONITOR_PID)"`
RUN `echo "================================================\n"`

## Read Specification
READ: PLAN_TO_EXECUTE

## Instructions

We're going to create NUMBER_OF_PARALLEL_WORKTREES new subagents that use the Task tool to create N versions of the same feature in parallel.

IMPORTANT: 
1. All safety checks have passed
2. Monitor is running in background
3. Each agent will work independently

The agents will work in:
- trees/<feature_pattern>-1/
- trees/<feature_pattern>-2/
- trees/<feature_pattern>-3/

## Launch Agents

Launch all agents simultaneously using the Task tool. Each agent should:
1. Read the specification
2. Work in their assigned worktree
3. Create RESULTS.md with their approach
4. Test their implementation
5. NOT run npm run dev

## Post-Execution

After agents complete:
1. Use ./agents-detailed.sh to review results
2. Monitor will continue running
3. To stop monitor: kill $MONITOR_PID

RUN `echo "\n✨ Launching ${NUMBER_OF_PARALLEL_WORKTREES} parallel agents now..."`