#!/usr/bin/env zsh

# Unified Sprint Planning Tool - Plan new sprints or see what's next

# Parse command line arguments
SHOW_NEXT=false
if [[ "$1" == "--next" ]] || [[ "$1" == "-n" ]]; then
  SHOW_NEXT=true
fi

echo "🎯 SPRINT PLANNING TOOL"
echo "======================"
echo ""

# 1. Find the highest sprint number
echo "📊 Analyzing sprints..."
echo "---------------------"

highest_sprint=0
if [[ -d "specs" ]]; then
  for file in specs/sprint-*.md; do
    if [[ -f "$file" ]]; then
      sprint_num=$(echo "$file" | sed 's/.*sprint-\([0-9]*\)-.*/\1/' | sed 's/^0*//')
      sprint_name=$(echo "$file" | sed 's/.*sprint-[0-9]*-\(.*\)\.md/\1/')
      
      echo "Sprint $sprint_num: $sprint_name"
      
      if [[ $sprint_num -gt $highest_sprint ]]; then
        highest_sprint=$sprint_num
      fi
    fi
  done
fi

if [[ $highest_sprint -eq 0 ]]; then
  echo "No previous sprints found"
  next_sprint=1
else
  next_sprint=$((highest_sprint + 1))
fi

echo ""
echo "📋 Next sprint number: $next_sprint"
echo ""

# If just showing next sprint, provide quick info and exit
if [[ "$SHOW_NEXT" == "true" ]]; then
  echo "💡 Suggested Next Sprints (from business priorities):"
  echo "---------------------------------------------------"
  
  case $next_sprint in
    3)
      echo "Sprint 3: Smart Defaults"
      echo "  - Implement privacy-preserving default settings"
      echo "  - Business Rule 11: Intelligent defaults"
      ;;
    4)
      echo "Sprint 4: Font Anatomy Enrichment"
      echo "  - Add typography metadata enrichment"
      echo "  - Our unique differentiator"
      ;;
    5)
      echo "Sprint 5: Multi-tenant Data Isolation"
      echo "  - Implement secure data separation"
      echo "  - Critical for enterprise security"
      ;;
    *)
      echo "Review business-context/forward-implications/ for priorities"
      ;;
  esac
  
  echo ""
  echo "🚀 To prepare: ./prepare-sprint.sh $next_sprint [sprint-name]"
  exit 0
fi

# Full interactive planning mode
echo "🔍 Available Resources:"
echo "----------------------"

# Check for unimplemented sprint plans
if [[ -d "/Users/alexjohnson/Dev Projects/BrandFontsIQ/implementation-guides/sprint-plans" ]]; then
  echo ""
  echo "📄 Sprint plans ready to use:"
  for plan in /Users/alexjohnson/Dev\ Projects/BrandFontsIQ/implementation-guides/sprint-plans/*.md; do
    if [[ -f "$plan" ]]; then
      plan_name=$(basename "$plan" .md)
      spec_name="specs/${plan_name}.md"
      
      if [[ ! -f "$spec_name" ]]; then
        echo "  - $plan_name"
      fi
    fi
  done
fi

echo ""
echo "📚 Key planning documents:"
echo "  - business-context/immutable-facts/business-rules-master-list.md"
echo "  - architecture/development-roadmap-v2.md"
echo "  - business-context/forward-implications/"
echo ""

# Interactive menu
echo "💡 PLANNING OPTIONS:"
echo "==================="
echo ""
echo "1) Copy existing plan to specs/"
echo "2) Create new sprint specification"
echo "3) View business priorities"
echo "4) Exit"
echo ""

read -k 1 "choice?Select option (1-4): "
echo ""

case $choice in
  1)
    echo ""
    echo "Select a plan to copy:"
    select plan in /Users/alexjohnson/Dev\ Projects/BrandFontsIQ/implementation-guides/sprint-plans/*.md; do
      if [[ -n "$plan" ]]; then
        plan_name=$(basename "$plan" .md)
        echo ""
        echo "Copying $plan_name to specs/..."
        cp "$plan" "specs/${plan_name}.md"
        echo "✅ Created specs/${plan_name}.md"
        echo ""
        
        # Extract sprint number and name
        sprint_num=$(echo "$plan_name" | sed 's/sprint-\([0-9]*\)-.*/\1/')
        sprint_short=$(echo "$plan_name" | sed 's/sprint-[0-9]*-//' | sed 's/-.*$//')
        
        echo "Next: ./prepare-sprint.sh $sprint_num $sprint_short"
        break
      fi
    done
    ;;
    
  2)
    echo ""
    read "sprint_num?Enter sprint number [$next_sprint]: "
    sprint_num=${sprint_num:-$next_sprint}
    read "sprint_name?Enter sprint name (hyphenated): "
    
    echo ""
    echo "📝 Sprint $sprint_num: $sprint_name"
    echo ""
    echo "To create the specification in Claude, use this prompt:"
    echo "=================================================="
    cat << 'EOF'
Create a sprint specification for Sprint $sprint_num: $sprint_name

1. Review business-context/immutable-facts/business-rules-master-list.md
2. Review business-context/forward-implications/ for this topic
3. Use the template from specs/sprint-03-smart-defaults.md

Include:
- Business context and which rules this implements
- Technical requirements (be specific)
- Success criteria (must be binary pass/fail)
- Test data location
- Expected outcomes

Save as: specs/sprint-$sprint_num-$sprint_name.md
EOF
    echo ""
    echo "After creating the spec:"
    echo "./prepare-sprint.sh $sprint_num $sprint_name"
    ;;
    
  3)
    echo ""
    echo "🎯 Sprint Priorities (from roadmap):"
    echo "-----------------------------------"
    echo "✅ Sprint 1: Unique Font Identification (DONE)"
    echo "✅ Sprint 2: Company Identification (DONE)"
    echo ""
    echo "📋 Next priorities:"
    echo "3. Smart Defaults - Immediate value without sensitive data"
    echo "4. Font Anatomy - Our unique differentiator"
    echo "5. Multi-tenant - Enterprise security requirement"
    echo "6. Performance Metrics - Business outcome connections"
    echo "7. Calculation Engine - Transparent, auditable metrics"
    echo ""
    echo "Each sprint should:"
    echo "- Implement specific business rules"
    echo "- Take 4-24 hours with 3 agents"
    echo "- Have clear success criteria"
    echo "- Build toward the larger vision"
    ;;
    
  4)
    echo "Planning complete."
    exit 0
    ;;
    
  *)
    echo "Invalid option."
    ;;
esac