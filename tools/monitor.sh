#!/usr/bin/env zsh
clear
echo "🔍 PARALLEL AGENT MONITOR"
echo "========================="
echo ""

# Dynamically detect the feature name from existing worktrees
feature_pattern=$(ls -d trees/*-1 2>/dev/null | head -1 | sed 's|trees/||' | sed 's|-1$||')

if [[ -z "$feature_pattern" ]]; then
  echo "❌ No worktrees found in trees/ directory"
  echo "   Run /simple-init-parallel <feature-name> first"
  sleep 5
  exit 1
fi

echo "📋 Feature: $feature_pattern"
echo ""

while true; do
  # Move cursor to line 7
  tput cup 6 0
  
  echo "Last Update: $(date +"%I:%M:%S %p")"
  echo ""
  
  # Check each agent
  for i in 1 2 3; do
    echo -n "Agent $i: "
    if [[ -f "trees/${feature_pattern}-$i/RESULTS.md" ]]; then
      echo "✅ COMPLETE"
    elif [[ -d "trees/${feature_pattern}-$i" ]]; then
      changes=$(cd "trees/${feature_pattern}-$i" 2>/dev/null && git status --porcelain | wc -l | tr -d ' ')
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