# Claude Memory Management Guide

## 🎯 Quick Reference: Memory Commands

### View/Edit Memory Files
```bash
# Edit main memory file
/memory CLAUDE.md

# Edit sprint-specific memory
/memory CLAUDE-SPRINT.md

# Edit technical architecture memory
/memory CLAUDE-TECH.md

# Quick add to memory (# prefix)
# Type: # Sprint 1 completed, moving to Sprint 2
# Then select which memory file to update
```

## 📁 Memory File Structure

### 1. **CLAUDE.md** (Core Knowledge)
- Immutable business rules
- Critical protocols
- Architecture decisions
- Key paths and locations
- Never-violate principles

### 2. **CLAUDE-SPRINT.md** (Active Work)
- Current sprint goals
- Success criteria
- Progress tracking
- Blockers
- Next actions

### 3. **CLAUDE-TECH.md** (Technical Reference)
- System architecture
- Technology stack
- Data models
- Security patterns
- Performance requirements

### 4. **Directory-Specific CLAUDE.md**
- `/src/lib/CLAUDE.md` - Calculation engine specifics
- `/src/components/CLAUDE.md` - UI component patterns

## 🔄 Daily Update Routine

### Morning Sync (Start of Session)
1. **Check Obsidian Vault for Updates**
   ```bash
   cat "/Users/alexjohnson/Dev Projects/BrandFontsIQ/📌 ACTIVE/NEXT-ACTIONS.md"
   cat "/Users/alexjohnson/Dev Projects/BrandFontsIQ/📝 SESSION-LOGS/CURRENT-STATUS.md"
   ```

2. **Update Sprint Memory**
   ```bash
   /memory CLAUDE-SPRINT.md
   # Update current status, completed items, new blockers
   ```

### During Work
1. **Quick Memory Updates**
   ```bash
   # Discovered new pattern
   # Font source detection requires checking THREE columns
   # (Select CLAUDE.md to add to business rules)
   ```

2. **Sprint Progress**
   ```bash
   # Completed font standardization algorithm
   # (Select CLAUDE-SPRINT.md to update progress)
   ```

### End of Session
1. **Document in Obsidian First** (per protocol)
2. **Update Memory with Key Learnings**
   ```bash
   /memory CLAUDE.md
   # Add any new immutable facts discovered
   ```

## 📝 What to Include in Each Memory

### CLAUDE.md Updates
- New business rules discovered
- Critical failures to avoid
- Architecture decisions made
- Protocol changes
- Path updates

### CLAUDE-SPRINT.md Updates
- Task completion status
- New blockers discovered
- Test results
- Next immediate actions
- Sprint pivots or changes

### CLAUDE-TECH.md Updates
- New technical patterns
- Library decisions
- Performance findings
- Security considerations
- Integration points

## 🚨 Critical Memory Rules

1. **Memory Augments, Never Replaces Obsidian**
   - Full documentation → Obsidian Vault
   - Quick reference → CLAUDE.md files

2. **Keep Memory Concise**
   - Key facts, not full explanations
   - Links to Obsidian for details
   - Focus on actionable information

3. **Binary Success Tracking**
   - Sprint goals are pass/fail
   - Update CLAUDE-SPRINT.md immediately on completion
   - No partial credit

4. **Version Your Understanding**
   ```markdown
   ## Evolution Log
   - 2025-06-02: Sprint 1 start, 205 fonts target
   - 2025-06-03: Discovered font sources in 3 columns
   ```

## 💡 Power User Tips

### 1. Template for New Discoveries
```markdown
## 🆕 Discovery: [Title]
- **What**: [Brief description]
- **Impact**: [Why it matters]
- **Action**: [What to do about it]
- **Obsidian Ref**: [Link to full documentation]
```

### 2. Quick Sprint Status Template
```markdown
## Sprint Status: [Date]
✅ Completed: [List]
🚧 In Progress: [List]
🚫 Blocked: [List]
⏭️ Next: [Immediate action]
```

### 3. Combine with Obsidian Workflow
```bash
# After discovering something important:
1. Document fully in Obsidian (per KCF protocol)
2. Extract key insight to memory: /memory CLAUDE.md
3. Update sprint if relevant: /memory CLAUDE-SPRINT.md
```

## 🔗 Related Obsidian Locations

### For Memory Updates, Check:
- `/business-context/immutable-facts/` - New business rules
- `/business-context/strategic-insights/` - Key discoveries
- `/📌 ACTIVE/` - Current priorities
- `/implementation-guides/` - New technical guidance
- `/business-context/critical-failures/` - What to avoid

## 🎯 Remember

**Obsidian = Permanent Record**
**Memory = Quick Reference**

Both work together to maintain context and accelerate development!

---
*Memory Management Guide v1.0*
*Created: 2025-06-02*