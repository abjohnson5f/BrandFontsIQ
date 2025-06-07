#!/usr/bin/env zsh

# Unified Status Script - Quick or Detailed sprint status

# Check for --detailed flag
DETAILED=false
if [[ "$1" == "--detailed" ]] || [[ "$1" == "-d" ]]; then
  DETAILED=true
fi

# Detect feature name from worktrees
feature_pattern=$(ls -d trees/*-1 2>/dev/null | head -1 | sed 's|trees/||' | sed 's|-1$||')

if [[ -z "$feature_pattern" ]]; then
  echo "❌ No active sprint found"
  exit 0
fi

# Quick status (default)
if [[ "$DETAILED" == "false" ]]; then
  # Count completed agents
  completed=0
  for i in 1 2 3; do
    [[ -f "trees/${feature_pattern}-$i/RESULTS.md" ]] && ((completed++))
  done
  
  # Build status line
  echo -n "🔍 Sprint Status: [$completed/3 complete] "
  
  # Show each agent status inline
  for i in 1 2 3; do
    dir="trees/${feature_pattern}-$i"
    echo -n "A$i:"
    
    if [[ -f "$dir/RESULTS.md" ]]; then
      # Get completion time
      timestamp=$(stat -f "%Sm" -t "%I:%M%p" "$dir/RESULTS.md" 2>/dev/null || echo "??")
      echo -n "✅($timestamp) "
    elif [[ -d "$dir" ]]; then
      # Count changed files
      changes=$(cd "$dir" 2>/dev/null && git status --porcelain | wc -l | tr -d ' ')
      if [[ -n "$changes" ]] && [[ "$changes" -gt 0 ]]; then
        echo -n "🔄($changes) "
      else
        echo -n "📦 "
      fi
    else
      echo -n "❌ "
    fi
  done
  
  # Total TypeScript files created
  total_files=$(find trees -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
  echo "| Files: $total_files"
  
else
  # Detailed status (with --detailed flag)
  echo "🔍 DETAILED AGENT STATUS REPORT"
  echo "==============================="
  echo "Time: $(date '+%I:%M:%S %p')"
  echo ""
  echo "📋 Feature: $feature_pattern"
  echo ""
  
  for i in 1 2 3; do
    dir="trees/${feature_pattern}-${i}"
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
      
      # Check for key directories
      echo "├─ Key directories:"
      echo "│  ├─ src/: $(test -d "src" && echo "✓ ($(find src -type f -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ') files)" || echo "✗")"
      echo "│  ├─ scripts/: $(test -d "scripts" && echo "✓ ($(find scripts -type f -name "*.ts" 2>/dev/null | wc -l | tr -d ' ') files)" || echo "✗")"
      echo "│  └─ output/: $(test -d "output" && echo "✓ ($(ls output 2>/dev/null | wc -l | tr -d ' ') files)" || echo "✗")"
      
      cd - > /dev/null
    fi
    
    echo "└─ Status: $(
      if [[ -f "$dir/RESULTS.md" ]]; then
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
    [[ -f "trees/${feature_pattern}-1/RESULTS.md" ]] && 
    [[ -f "trees/${feature_pattern}-2/RESULTS.md" ]] && 
    [[ -f "trees/${feature_pattern}-3/RESULTS.md" ]] && 
    echo "✓ YES" || echo "✗ NO"
  )"
  echo "└─ Total files changed: $(
    total=0
    for i in 1 2 3; do
      if [[ -d "trees/${feature_pattern}-$i" ]]; then
        changes=$(cd "trees/${feature_pattern}-$i" && git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
        total=$((total + changes))
      fi
    done
    echo $total
  )"
fi