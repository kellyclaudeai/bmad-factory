# Workspace Skills

**ALL skills for ALL agents live here.** No per-agent skills, no global skills.

This simplifies discovery and avoids confusion about which skills are available where.

## Structure

- **build/** - Build, development, and quality assurance
- **factory/** - Factory pipeline management
- **plan/** - Planning and requirements
- **test/** - Testing and QA
- **utilities/** - General-purpose utilities
- **web/** - Web development tech stack

## How Skills Work

OpenClaw auto-discovers skills from this directory and injects them into the system prompt as `<available_skills>` XML. The model uses the `read` tool to load SKILL.md when needed.

**Do NOT list skills in AGENTS.md** - OpenClaw handles discovery automatically.

## Precedence

1. `<workspace>/skills/` ← THIS DIRECTORY (only location we use)
2. ~~`~/.openclaw/skills/`~~ (removed - not used)
3. Bundled OpenClaw skills (fallback for standard tools)

## Adding Skills

1. Use `skill-creator` skill to design new skills
2. Place in appropriate subdirectory
3. Test thoroughly before committing
4. Skills are discovered automatically on next session
