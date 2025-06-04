#!/bin/bash

# Parse Task Execution Logs from Claude Code --verbose output
# Usage: ./parse-task-logs.sh <log-file>

if [ $# -eq 0 ]; then
    echo "Usage: $0 <log-file>"
    echo "Example: $0 logs/sprint2-verbose-20250603-142015.log"
    exit 1
fi

LOG_FILE=$1

if [ ! -f "$LOG_FILE" ]; then
    echo "Error: Log file not found: $LOG_FILE"
    exit 1
fi

echo "═══════════════════════════════════════════════════════════════"
echo "                   TASK EXECUTION ANALYSIS                      "
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Log file: $LOG_FILE"
echo "Analysis time: $(date)"
echo ""

# Extract key patterns
echo "🔍 SEARCHING FOR TASK EXECUTION PATTERNS..."
echo ""

# Find Task agent references
echo "📋 Task/Agent References:"
grep -n -E "(Task|Agent|company-id-[123])" "$LOG_FILE" | head -20

echo ""
echo "⚠️  Error/Failure Indicators:"
ERRORS=$(grep -n -E "(Error|Failed|failure|error:|Exception|exception)" "$LOG_FILE" | grep -v "node_modules")
if [ -z "$ERRORS" ]; then
    echo "✅ No errors found"
else
    echo "$ERRORS" | head -20
fi

echo ""
echo "✅ Success Indicators:"
SUCCESSES=$(grep -n -E "(Success|successfully|completed|Complete)" "$LOG_FILE" | grep -v "node_modules")
if [ -z "$SUCCESSES" ]; then
    echo "❌ No success messages found"
else
    echo "$SUCCESSES" | head -10
fi

echo ""
echo "🎯 Task Summaries:"
grep -n -E "(Summary|summary|RESULTS|Results)" "$LOG_FILE" | head -10

echo ""
echo "📁 File Operations:"
grep -n -E "(Creating|Writing|Created|creating file|writing to)" "$LOG_FILE" | head -10

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                        AGENT STATUS                            "
echo "═══════════════════════════════════════════════════════════════"

# Try to determine status of each agent
for i in 1 2 3; do
    echo ""
    echo "🤖 Agent $i (company-id-$i):"
    
    # Check for activity
    AGENT_ACTIVITY=$(grep -E "company-id-$i|Agent $i" "$LOG_FILE" | wc -l)
    echo "   Activity mentions: $AGENT_ACTIVITY"
    
    # Check for RESULTS.md creation
    RESULTS_CREATED=$(grep -E "company-id-$i.*RESULTS\.md|Creating.*company-id-$i.*RESULTS" "$LOG_FILE")
    if [ -n "$RESULTS_CREATED" ]; then
        echo "   ✅ RESULTS.md created"
    else
        echo "   ❌ No RESULTS.md found"
    fi
    
    # Check for errors specific to this agent
    AGENT_ERRORS=$(grep -E "company-id-$i.*[Ee]rror|[Ee]rror.*company-id-$i" "$LOG_FILE")
    if [ -n "$AGENT_ERRORS" ]; then
        echo "   ⚠️  Errors found:"
        echo "$AGENT_ERRORS" | head -3
    fi
done

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                      EXECUTION TIMELINE                        "
echo "═══════════════════════════════════════════════════════════════"

# Extract timestamps if present
echo ""
echo "🕐 Key Timestamps:"
grep -E "^[0-9]{4}-[0-9]{2}-[0-9]{2}|^\[[0-9]{2}:[0-9]{2}:[0-9]{2}\]" "$LOG_FILE" | head -10

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "                          SUMMARY                               "
echo "═══════════════════════════════════════════════════════════════"

# Count key indicators
TASK_COUNT=$(grep -c -E "Task|task" "$LOG_FILE")
ERROR_COUNT=$(grep -c -E "[Ee]rror|[Ff]ailed" "$LOG_FILE" | grep -v "node_modules")
SUCCESS_COUNT=$(grep -c -E "[Ss]uccess|[Cc]omplete" "$LOG_FILE" | grep -v "node_modules")

echo ""
echo "📊 Statistics:"
echo "   Total Task mentions: $TASK_COUNT"
echo "   Error indicators: $ERROR_COUNT"
echo "   Success indicators: $SUCCESS_COUNT"

echo ""
echo "💡 Next Steps:"
echo "1. Check actual file system for verification:"
echo "   cd trees/company-id-2 && ls -la RESULTS.md"
echo "2. If Agent 2 failed, look for error patterns above"
echo "3. Consider re-running just Agent 2 separately"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Analysis complete. For detailed investigation, search the log directly."