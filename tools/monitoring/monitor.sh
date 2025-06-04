#!/usr/bin/env zsh
clear
echo "🔍 PARALLEL AGENT MONITOR"
echo "========================="
echo ""

while true; do
  # Move cursor to line 4
  tput cup 4 0
  
  echo "Last Update: $(date +"%I:%M:%S %p")"
  echo ""
  
  # Check each agent
  for i in 1 2 3; do
    echo -n "Agent $i: "
    if [[ -f "trees/company-id-correct-$i/RESULTS.md" ]]; then
      echo "✅ COMPLETE"
    elif [[ -d "trees/company-id-correct-$i" ]]; then
      changes=$(cd "trees/company-id-correct-$i" 2>/dev/null && git status --porcelain | wc -l | tr -d ' ')
      if [[ -n "$changes" ]] && [[ "$changes" -gt 0 ]]; then
        echo "🔄 WORKING ($changes files)"
      else
        echo "📦 SETTING UP"
      fi
    else
      echo "⏳ NOT STARTED"
    fi
  done
  
  echo ""
  echo "📊 System Info:"
  echo "├─ Active processes: $(pgrep -f node | wc -l | tr -d ' ')"
  echo "└─ Time: $(date +"%I:%M %p")"
  
  sleep 2
done