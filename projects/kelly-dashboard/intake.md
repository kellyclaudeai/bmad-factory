# Kelly Factory Dashboard Upgrade

## Project Type
Fast Track - Barry Implementation

## Overview
Upgrade existing factory dashboard from basic HTML/CSS/JS to modern Next.js 15 with terminal aesthetic, granular progress tracking, and factory health monitoring.

## Current State
Existing dashboard at `/Users/austenallred/clawd/factory-dashboard/` (HTML/CSS/JS + Node.js backend)

## Requirements
- Migrate to Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui
- Terminal aesthetic (matrix-inspired: dark, green/amber accents)
- 3-view architecture: Factory View → Project Detail → Subagent Detail
- Factory health dashboard (failures, bottlenecks, queue depth, cost tracking)
- Real-time session data integration (OpenClaw Gateway API)
- File system state integration (project-state.json, state files)
- All-time project history with pagination

## Barry Planning Complete
Barry created comprehensive implementation plan: `barry-plan.md` (12 stories, 4h 10m total, parallelizes to 2h 10m)

## Deliverables
- Working Next.js app at `/Users/austenallred/clawd/projects/kelly-dashboard/`
- Three views with routing
- Factory health metrics dashboard
- Real-time polling (10s refresh)
- Terminal aesthetic styling
- npm run dev starts on port 3000

## Fast Track
fast_track: true

## Status
Planning complete, ready for parallel Barry implementation orchestration
