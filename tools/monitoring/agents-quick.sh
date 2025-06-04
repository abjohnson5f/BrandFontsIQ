#!/usr/bin/env zsh

# Quick one-line status with more detail than basic 'agents' command

echo -n "🔍 Sprint Status: "

# Count completed agents
completed=0
for i in 1 2 3; do
  [[ -f "trees/company-id-correct-$i/RESULTS.md" ]] && ((completed++))
done

# Show summary
echo -n "[$completed/3 complete] "

# Show each agent status with timing
for i in 1 2 3; do
  dir="trees/company-id-correct-$i"
  echo -n "A$i:"
  
  if [[ -f "$dir/RESULTS.md" ]]; then
    # Get time of RESULTS.md
    time=$(stat -f "%Sm" -t "%I:%M%p" "$dir/RESULTS.md" 2>/dev/null | tr -d ' ')
    echo -n "✅($time) "
  elif [[ -d "$dir" ]]; then
    # Count files
    files=$(cd "$dir" 2>/dev/null && git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
    if [[ -n "$files" ]] && [[ "$files" -gt 0 ]]; then
      echo -n "🔄($files) "
    else
      echo -n "📦 "
    fi
  else
    echo -n "⏳ "
  fi
done

# Show total files created
total_files=$(find trees -type f -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
echo "| Files: $total_files"