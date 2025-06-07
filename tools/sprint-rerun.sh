#!/usr/bin/env zsh

# Sprint Re-run Script - Complete fresh start

echo "🔄 SPRINT RE-RUN UTILITY"
echo "======================="
echo ""

# 1. Detect current sprint from worktrees or recent guides
current_sprint=""
spec_file=""

# Try to detect from worktrees first
if [[ -d "trees" ]]; then
  current_sprint=$(ls -d trees/*-1 2>/dev/null | head -1 | sed 's|trees/||' | sed 's|-1$||')
fi

# If no worktrees, check for recent SPRINT-X-GUIDE.md files
if [[ -z "$current_sprint" ]]; then
  latest_guide=$(ls SPRINT-*-GUIDE.md 2>/dev/null | sort -V | tail -1)
  if [[ -n "$latest_guide" ]]; then
    sprint_num=$(echo "$latest_guide" | sed 's/SPRINT-\([0-9]*\)-GUIDE.md/\1/')
    # Extract sprint name from the guide file
    spec_line=$(grep "specs/sprint-" "$latest_guide" | head -1)
    if [[ -n "$spec_line" ]]; then
      spec_file=$(echo "$spec_line" | grep -o 'specs/sprint-[^.]*\.md' | head -1)
      current_sprint=$(echo "$spec_file" | sed 's|specs/sprint-[0-9]*-||' | sed 's|\.md||')
    fi
  fi
fi

if [[ -z "$current_sprint" ]]; then
  echo "❌ ERROR: Cannot detect current/recent sprint!"
  echo ""
  echo "No worktrees or sprint guides found."
  echo "Use ./prepare-sprint.sh to start a new sprint."
  exit 1
fi

# Find the specification file if not already found
if [[ -z "$spec_file" ]]; then
  # Try exact match first
  spec_file=$(find specs -name "*${current_sprint}*.md" 2>/dev/null | head -1)
  
  # If no exact match, try fuzzy matching
  if [[ -z "$spec_file" ]]; then
    # Convert underscores to hyphens and try again
    alt_name=$(echo "$current_sprint" | tr '_' '-')
    spec_file=$(find specs -name "*${alt_name}*.md" 2>/dev/null | head -1)
  fi
  
  # If still no match, look for any spec with similar sprint number
  if [[ -z "$spec_file" ]]; then
    # Extract sprint number from worktree if possible
    if [[ -d "trees" ]]; then
      # List all specs and let user choose
      echo "⚠️  Cannot auto-detect specification for '$current_sprint'"
      echo ""
      echo "Available specifications:"
      specs_count=0
      for spec in specs/sprint-*.md; do
        if [[ -f "$spec" ]]; then
          specs_count=$((specs_count + 1))
          echo "  $specs_count) $spec"
        fi
      done
      
      if [[ $specs_count -gt 0 ]]; then
        echo ""
        read "choice?Select specification (1-$specs_count): "
        spec_file=$(ls specs/sprint-*.md | sed -n "${choice}p")
      fi
    fi
  fi
fi

if [[ -z "$spec_file" ]] || [[ ! -f "$spec_file" ]]; then
  echo "❌ ERROR: No specification found or selected"
  exit 1
fi

echo "📋 Sprint to Re-run: $current_sprint"
echo "📄 Specification: $spec_file"
echo ""

# 2. Show what will be cleaned
echo "🧹 This will RESET the following:"
echo "---------------------------------"
echo "✓ All git worktrees in trees/"
echo "✓ All feature branches" 
echo "✓ Sprint guide files (SPRINT-*-GUIDE.md)"
echo "✓ Any test output files"
echo "✓ Monitor logs"
echo ""
echo "🛡️ PROTECTED (Never Touched):"
echo "✗ Sprint specifications in specs/ - DO NOT TOUCH"
echo "✗ Your main branch code"
echo "✗ Obsidian vault"
echo ""

# 3. Auto-proceed with cleanup (specs are safe)
echo "🔄 Starting fresh sprint run in 3 seconds..."
echo "   (Ctrl+C to cancel)"
sleep 3

echo ""
echo "🔥 COMPLETE SPRINT RESET IN PROGRESS..."
echo "======================================"

# 4. Clean up worktrees
if [[ -d "trees" ]]; then
  echo "Removing all worktrees..."
  # Force remove each worktree
  for worktree in trees/*; do
    if [[ -d "$worktree" ]]; then
      worktree_name=$(basename "$worktree")
      git worktree remove "$worktree" --force 2>/dev/null || true
    fi
  done
  # Remove the entire trees directory
  rm -rf trees
fi

# 5. Clean up branches
echo "Removing all feature branches..."
# Get all branches that match the sprint pattern
git branch | grep -E "${current_sprint}-[0-9]" | while read branch; do
  git branch -D "$branch" 2>/dev/null || true
done

# Also clean up any other sprint branches
git branch | grep -E "sprint-.*-[0-9]$" | while read branch; do
  git branch -D "$branch" 2>/dev/null || true
done

# 6. Prune git worktree list
echo "Pruning git worktree list..."
git worktree prune

# 7. Clean up sprint guides and test files
echo "Removing sprint guides and test files..."
rm -f SPRINT-*-GUIDE.md
rm -f test*.js test*.ts RESULTS.md
rm -f output/*.xlsx output/*.json 2>/dev/null || true

# 8. Clean up any monitor logs
echo "Cleaning monitor logs..."
rm -f /tmp/monitor-*.log 2>/dev/null || true
rm -f logs/sprint-*.log 2>/dev/null || true

# 9. Kill any running monitors
echo "Stopping any running monitors..."
pkill -f "monitor.sh" 2>/dev/null || true
pkill -f "monitor-agents.sh" 2>/dev/null || true

# 10. Final verification
echo ""
echo "✅ COMPLETE RESET FINISHED!"
echo "=========================="
echo ""
echo "📊 Verification:"
git worktree list | grep -v "main" && echo "❌ Some worktrees remain!" || echo "✓ All worktrees removed"
git branch | grep -E "sprint-.*-[0-9]$" && echo "❌ Some branches remain!" || echo "✓ All sprint branches removed"
ls SPRINT-*-GUIDE.md 2>/dev/null && echo "❌ Guide files remain!" || echo "✓ All guides removed"
[[ -d "trees" ]] && echo "❌ trees/ directory remains!" || echo "✓ trees/ directory removed"

echo ""
echo "🎯 FRESH START INSTRUCTIONS:"
echo "==========================="
echo ""
echo "1️⃣  Prepare the sprint again:"
echo "    ./prepare-sprint.sh $(echo $spec_file | sed 's/.*sprint-\([0-9]*\)-.*/\1/') $current_sprint"
echo ""
echo "2️⃣  In Claude Desktop, initialize worktrees:"
echo "    /simple-init-parallel $current_sprint"
echo ""
echo "3️⃣  Execute the sprint:"
echo "    /exe-parallel-enhanced $spec_file 3"
echo ""
echo "4️⃣  Monitor progress:"
echo "    ./monitor.sh"
echo ""
echo "💡 This is a completely fresh start - like running the sprint for the first time!"