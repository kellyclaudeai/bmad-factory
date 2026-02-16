# Local Workspace Skills

This directory contains skills specific to our factory/BMAD workflow. These are separate from the global OpenClaw skills to avoid confusion and allow custom factory-specific skills.

## Structure

- **build/** - Build, development, and quality assurance skills
  - coding-agent - Run Codex CLI, Claude Code, OpenCode, or Pi Coding Agent
  - security-audit - Security review and vulnerability assessment
  
- **factory/** - Factory pipeline management skills
  - memory-system-v2 - Fast semantic memory with JSON indexing
  - project-lead-instantiator - Create/reuse project-specific Project Lead sessions
  - session-closer - Close/archive completed project sessions
  
- **plan/** - Planning and requirements skills
  - (future: requirements gathering, project scoping, etc.)
  
- **test/** - Testing and QA skills
  - tea-smoke-test-web.sh - Web app smoke tests
  - tea-smoke-test-ios.sh - iOS app smoke tests
  
- **utilities/** - General-purpose utility skills
  - github - GitHub CLI integration (issues, PRs, CI)
  - gog - Google Workspace (Gmail, Calendar, Drive, Contacts, Sheets, Docs)
  - skill-creator - Create and package new skills
  - things-mac - Things 3 task management (macOS)
  - tmux - Remote control tmux sessions for interactive CLIs
  - web-browser - Playwright CDP browser automation (zero clicks)
  - web-search - SearXNG local search
  
- **web/** - Web development tech stack
  - tech-stack/firebase-cli - Firebase + GCP backend provisioning
  - tech-stack/oauth-automation - OAuth client setup automation

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
