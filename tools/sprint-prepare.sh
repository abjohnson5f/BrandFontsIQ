#!/usr/bin/env zsh

# Sprint Preparation Script - One command to set up everything

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./prepare-sprint.sh [number] [name]"
  echo "Example: ./prepare-sprint.sh 3 smart-defaults"
  exit 1
fi

SPRINT_NUM=$1
SPRINT_NAME=$2
SPRINT_ID="sprint-$(printf "%02d" $SPRINT_NUM)-$SPRINT_NAME"

echo "🚀 PREPARING SPRINT $SPRINT_NUM: $SPRINT_NAME"
echo "========================================"
echo ""

# 1. Clean up from previous sprint
echo "📧 Step 1: Cleaning up previous sprint..."
echo "----------------------------------------"

# Show current worktrees
echo "Current worktrees:"
git worktree list | grep -v "main" || echo "None found"

# Check for existing worktrees
if [ -d "trees" ]; then
  echo "Existing worktrees found:"
  ls -la trees/
  echo ""
  echo "⚠️  WARNING: Old sprint worktrees still exist!"
  echo "   To clean them manually: rm -rf trees/ && git worktree prune"
  echo "   Or keep them to preserve work"
else
  echo "✓ No old worktrees found"
fi

# Clean up any test files in root
echo "Cleaning root directory..."
rm -f testHybrid*.js test*.js RESULTS.md 2>/dev/null
echo "✓ Root directory cleaned"

echo ""

# 2. Create sprint specification
echo "📋 Step 2: Creating sprint specification..."
echo "----------------------------------------"

# Create specs directory if needed
mkdir -p specs

# Check if spec already exists
if [ -f "specs/$SPRINT_ID.md" ]; then
  echo "✓ Specification already exists: specs/$SPRINT_ID.md"
else
  echo "❌ Specification not found: specs/$SPRINT_ID.md"
  echo ""
  echo "ACTION NEEDED: Ask Claude to create the specification"
  echo "Say: 'Create Sprint $SPRINT_NUM specification for $SPRINT_NAME'"
fi

echo ""

# 3. Create step-by-step guide
echo "📝 Step 3: Creating your step-by-step guide..."
echo "--------------------------------------------"

cat > "SPRINT-${SPRINT_NUM}-GUIDE.md" << 'EOF'
# Sprint SPRINT_NUM Execution Guide

## Pre-Flight Checklist
- [ ] Previous sprint cleaned up (✓ Done by prepare-sprint.sh)
- [ ] Sprint specification created at: specs/SPRINT_ID.md
- [ ] You're in the main project directory
- [ ] Terminal split into two panes

## Step-by-Step Execution

### 1. Start Monitor (Left Terminal)
```bash
./monitor.sh
```

### 2. Initialize Worktrees (Right Terminal - Claude Code)
```
/simple-init-parallel FEATURE_NAME
```

### 3. Execute Sprint (Right Terminal - Claude Code)
```
/exe-parallel specs/SPRINT_ID.md 3
```

### 4. Monitor Progress
- Watch left terminal for status changes
- If stuck, run in a new terminal: `agents`
- For details: `./agents-detailed.sh`

### 5. If Agents Need Input
Check the Claude Code terminal for prompts. Common responses:
- API Key needed: "Stop and show me how to get one"
- Approach question: "Use your recommended approach"
- Cost approval: Check amount, then "Y" or "N"

### 6. After Completion
When all agents show ✅ COMPLETE:
1. Run `./agents-detailed.sh` to verify
2. Review each RESULTS.md file
3. Compare approaches
4. Select best implementation

## Quick Commands Reference
```bash
agents                    # Quick status
./agents-detailed.sh      # Full details
cd trees/FEATURE_NAME-1   # Check specific agent
```

## Red Flags
- Agent stuck at same file count for 5+ min
- Large time gaps between completions
- File count < 8-10 (usually indicates problem)

## Remember
- Trust your instincts - if it looks wrong, investigate
- Agents should ask for input on important decisions
- No mock data - real implementation only
EOF

# Replace placeholders in guide
sed -i '' "s/SPRINT_NUM/$SPRINT_NUM/g" "SPRINT-${SPRINT_NUM}-GUIDE.md"
sed -i '' "s/SPRINT_ID/$SPRINT_ID/g" "SPRINT-${SPRINT_NUM}-GUIDE.md"
sed -i '' "s/FEATURE_NAME/$SPRINT_NAME/g" "SPRINT-${SPRINT_NUM}-GUIDE.md"

echo "✓ Created SPRINT-${SPRINT_NUM}-GUIDE.md"
echo ""

# 4. Show summary
echo "✅ PREPARATION COMPLETE!"
echo "======================="
echo ""
echo "📁 Files Created/Checked:"
echo "  - SPRINT-${SPRINT_NUM}-GUIDE.md (your step-by-step guide)"
echo "  - specs/$SPRINT_ID.md (specification - create if missing)"
echo ""
echo "🎯 Next Steps:"
echo "  1. Open SPRINT-${SPRINT_NUM}-GUIDE.md in preview"
echo "  2. Ensure specs/$SPRINT_ID.md exists"
echo "  3. Follow the guide step-by-step"
echo ""
echo "💡 Quick Start:"
echo "  Left terminal:  ./monitor.sh"
echo "  Right terminal: /simple-init-parallel $SPRINT_NAME"
echo ""