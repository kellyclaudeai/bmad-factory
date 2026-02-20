# BOOTSTRAP.md - Project Lead First-Run Setup

## On First Spawn

When a Project Lead is spawned for a new project, run these initialization steps **IN ORDER**:

---

## Step 1: Initialize Git Repository (CRITICAL)

**MUST BE FIRST** - BMAD workflows require git operations. Initialize git before any other work:

```bash
cd {projectRoot}

# Initialize git if not already done
if [ ! -d .git ]; then
  git init
  git add .gitignore README.md intake.md 2>/dev/null || true
  git commit --allow-empty -m "chore: Initial project setup"
  echo "✅ Git initialized with initial commit"
else
  # Verify git has at least one commit
  if ! git log -1 &>/dev/null; then
    git add .gitignore README.md intake.md 2>/dev/null || true
    git commit --allow-empty -m "chore: Initial project setup"
    echo "✅ Git initialized with initial commit"
  else
    echo "✅ Git already initialized"
  fi
fi
```

**Why this matters:**
- BMAD workflows (Amelia, Murat) use git for commits and validation
- Without an initial commit, BMAD will block indefinitely on git operations
- **Learned from fleai-market v4:** Story 1.4 ran 5h+ because git had no commits, BMAD workflow blocked on git operations

---

## Step 2: Install BMAD with TEA Module

```bash
cd {projectRoot}
npx bmad-method install --tools codex,claude-code --modules bmm,tea --yes
```

**What this does:**
- Installs BMM (BMAD Method Module) - core workflows (John, Sally, Winston, Bob, Amelia)
- Installs TEA (Test Architect Enterprise) - advanced test workflows (Murat)
- Installs for both Codex (global `~/.codex/prompts/`) and Claude Code (local `.claude/commands/`)

**Verification:**
```bash
ls ~/.codex/prompts/bmad-*.md | wc -l  # Should show 50+ prompts
ls .claude/commands/bmad-*.md | wc -l  # Should show 50+ commands
```

---

## Step 3: Initialize Project State Files

Create required state tracking files:

```bash
# Project state
cat > project-state.json << 'EOF'
{
  "projectId": "{projectId}",
  "status": "planning",
  "stage": "planning",
  "startedAt": "{ISO-8601-timestamp}",
  "subagents": [],
  "planningArtifacts": {
    "intake": "intake.md",
    "prd": null,
    "uxDesign": null,
    "architecture": null,
    "epics": null,
    "storiesJson": null
  },
  "implementationArtifacts": {
    "storiesStatus": null,
    "completedStories": [],
    "blockedStories": [],
    "failedAttempts": []
  },
  "teaArtifacts": {
    "testPlan": null,
    "testResults": null,
    "gateDecision": null
  },
  "pipelineResult": null,
  "lastHeartbeat": "{ISO-8601-timestamp}",
  "notes": "{brief-project-description}"
}
EOF

# Planning state (if starting in planning stage)
touch planning-state.md
```

See factory documentation for complete state file schemas.

---

## Step 4: Verify Skills Available

Confirm these skills are loaded:
- `coding-agent` - BMAD + Codex/Claude Code patterns
- `spawning-protocol` - Sub-agent spawn templates
- `web-browser` - Account automation (Supabase, etc.)

---

## Step 5: Mark Bootstrap Complete

After successful initialization:
1. Delete this BOOTSTRAP.md file: `rm BOOTSTRAP.md`
2. Proceed with project intake processing

---

## Critical Order

**Git → BMAD → State Files → Delete Bootstrap**

Git initialization MUST happen first to prevent BMAD workflows from blocking on git operations during implementation.

---

## Notes

- TEA module is **required** for Murat (test automation workflows)
- Without TEA: Quinn (basic QA) is available but limited
- With TEA: Full test strategy, risk-based planning, quality gates
- CSV separator (`codex,claude-code`) installs for both tools simultaneously
- **Git initialization prevents the "Story 1.4 failure mode"** where BMAD blocks for hours waiting for git to exist
