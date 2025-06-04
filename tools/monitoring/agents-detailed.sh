#!/usr/bin/env zsh

echo "🔍 DETAILED AGENT STATUS REPORT"
echo "==============================="
echo "Time: $(date '+%I:%M:%S %p')"
echo ""

for i in 1 2 3; do
  dir="trees/company-id-correct-$i"
  echo "📦 Agent $i - $dir"
  echo "├─ Directory exists: $(test -d "$dir" && echo "✓" || echo "✗")"
  
  if [[ -d "$dir" ]]; then
    cd "$dir" 2>/dev/null
    
    # Check RESULTS.md
    if [[ -f "RESULTS.md" ]]; then
      echo "├─ RESULTS.md: ✓ ($(stat -f "%Sm" -t "%I:%M %p" RESULTS.md))"
      echo "├─ RESULTS.md size: $(wc -l RESULTS.md | awk '{print $1}') lines"
    else
      echo "├─ RESULTS.md: ✗"
    fi
    
    # Git status
    changes=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
    echo "├─ Git changes: $changes files"
    
    # Most recent activity
    latest=$(find . -type f -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./.next/*" -exec stat -f "%m %Sm %N" -t "%I:%M:%S" {} \; 2>/dev/null | sort -rn | head -3)
    echo "├─ Recent activity:"
    echo "$latest" | while read line; do
      timestamp=$(echo "$line" | awk '{print $2}')
      filename=$(echo "$line" | awk '{print $3}' | sed 's|^\./||')
      echo "│  └─ $timestamp - $filename"
    done
    
    # Check for key files
    echo "├─ Key files:"
    echo "│  ├─ src/lib/company-identification/: $(test -d "src/lib/company-identification" && echo "✓" || echo "✗")"
    echo "│  ├─ scripts/test-company-identification*.ts: $(ls scripts/test-company-identification*.ts 2>/dev/null | wc -l | tr -d ' ') files"
    echo "│  └─ CLAUDE.md updated: $(test -f "CLAUDE.md" && test "CLAUDE.md" -nt "../../../CLAUDE.md" && echo "✓" || echo "✗")"
    
    cd - > /dev/null
  fi
  echo "└─ Status: $(
    if [[ -f "$dir/RESULTS.md" ]]; then
      # Check if any file was modified in last 5 minutes
      recent=$(cd "$dir" && find . -type f -not -path "./.git/*" -not -path "./node_modules/*" -mmin -5 2>/dev/null | wc -l | tr -d ' ')
      if [[ $recent -gt 0 ]]; then
        echo "🏗️  FINALIZING"
      else
        echo "✅ COMPLETE"
      fi
    elif [[ -d "$dir" ]]; then
      if [[ $changes -gt 0 ]]; then
        echo "🔄 WORKING"
      else
        echo "📦 SETTING UP"
      fi
    else
      echo "⏳ NOT STARTED"
    fi
  )"
  echo ""
done

echo "💡 Quick summary:"
echo "├─ All agents have RESULTS.md: $(
  [[ -f "trees/company-id-correct-1/RESULTS.md" ]] && 
  [[ -f "trees/company-id-correct-2/RESULTS.md" ]] && 
  [[ -f "trees/company-id-correct-3/RESULTS.md" ]] && 
  echo "✓ YES" || echo "✗ NO"
)"
echo "└─ Total files changed: $(
  total=0
  for i in 1 2 3; do
    if [[ -d "trees/company-id-correct-$i" ]]; then
      changes=$(cd "trees/company-id-correct-$i" && git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
      total=$((total + changes))
    fi
  done
  echo $total
)"