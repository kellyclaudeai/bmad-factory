# Local Workspace Skills

This directory contains skills specific to our factory/BMAD workflow. These are separate from the global OpenClaw skills to avoid confusion and allow custom factory-specific skills.

## Structure

- **build/** - Build, development, and quality assurance skills
- **factory/** - Factory pipeline management skills
- **kelly-router/** - Kelly Router specific skills
- **plan/** - Planning and requirements skills
- **test/** - Testing and QA skills
- **utilities/** - General-purpose utility skills
- **web/** - Web development tech stack

See individual subdirectories for specific skills. OpenClaw auto-discovers skills and injects them into the system prompt.

## Adding Skills

1. Use `skill-creator` skill to design new skills
2. Place in appropriate subdirectory (build/plan/implementation/utilities/web)
3. Test thoroughly before committing
4. Document in this README

## Skill Discovery

Skills are discovered by:
- Name and description in YAML frontmatter (for triggering)
- Location in AGENTS.md available_skills list

## Clawhub Integration

Future: Consider adding a skill-installer that can pull from clawhub.com when needed.
