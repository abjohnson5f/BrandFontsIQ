# Monitor Parallel Agents

## Purpose
Provides real-time visibility of parallel agent execution within Cursor's terminal

## Instructions

Open a new terminal tab in Cursor and run this monitoring command:

```bash
# Create monitoring script
cat > monitor.sh << 'EOF'
#!/usr/bin/env zsh
clear
echo "🔍 AGENT MONITOR - Real-time Status"
echo "=================================="

# Colors for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

while true; do
  # Move cursor to line 3
  tput cup 3 0
  
  # Check each worktree
  for i in {1..3}; do
    echo -ne "Agent $i: "
    
    # Check various indicators of progress
    if [[ -f "trees/company-id-real-$i/RESULTS.md" ]]; then
      echo -e "${GREEN}✅ COMPLETE${NC}"
      # Show result summary
      lines=$(wc -l < "trees/company-id-real-$i/RESULTS.md" 2>/dev/null || echo "0")
      echo "         └─ Results: $lines lines"
    elif [[ -d "trees/company-id-real-$i" ]]; then
      # Check git status for activity
      cd "trees/company-id-real-$i" 2>/dev/null
      if [[ $? -eq 0 ]]; then
        changes=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
        files=$(find src -newer package.json 2>/dev/null | wc -l | tr -d ' ')
        
        if [[ $changes -gt 0 ]]; then
          echo -e "${YELLOW}🔄 ACTIVE${NC}"
          echo "         ├─ Changes: $changes"
          echo "         └─ New files: $files"
        else
          echo -e "${YELLOW}📦 SETUP${NC}"
        fi
        cd - > /dev/null
      fi
    else
      echo -e "${RED}⏳ WAITING${NC}"
    fi
    echo ""
  done
  
  # Show system stats
  echo -e "\n📊 System Status:"
  echo "├─ Time: $(date +%H:%M:%S)"
  echo "├─ Node processes: $(pgrep -f node | wc -l | tr -d ' ')"
  echo "└─ Load: $(uptime | awk -F'load average:' '{print $2}')"
  
  sleep 2
done
EOF

chmod +x monitor.sh
./monitor.sh
```

## Usage in Cursor

1. Click the "+" button in Cursor's terminal to open a new tab
2. Run the monitor command above
3. Switch back to main terminal tab
4. Run your parallel execution
5. Switch between tabs to see real-time progress

## Alternative: Split Terminal

In Cursor, you can also:
1. Right-click in terminal area
2. Select "Split Terminal" 
3. Run monitor in one pane, execution in the other