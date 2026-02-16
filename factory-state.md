# Factory State

**Last Updated:** 2026-02-15 21:38 CST

## Active Projects

### kelly-dashboard
- **Status:** Project Details currently depends on on-disk `project-state.json.subagents` to show “active subagents”. Live spawned work may not appear unless state is written/updated.
- **Repo path:** `projects/kelly-dashboard`
- **Pending UX/data fix:** Decide whether to (a) write subagent progress into `project-state.json` (correct-by-design) and/or (b) augment Project Details to join live sessions from `/api/sessions`.

### meeting-time-tracker-web
- **Status:** Pivoted to Firebase-only; migration in progress (remove Supabase, wire Firebase Auth + Firestore + calendar sync).
- **Repo path:** `projects/meeting-time-tracker-web`
- **Backend:** Firebase (Auth + Firestore)
- **Notes:** Firebase/GCP projectId `meeting-time-tracker-aaf`; redirect `http://localhost:3000/auth/callback`.
- **Work packets:** Parallel A/B/C/D spawned; A/B/C/D completed and merged to `main`.
- **Build:** `npm run build` passes on `main`.

### Browser automation (infrastructure)
- **Status:** Chrome CDP automation set up
- **CDP:** `http://127.0.0.1:9222`
- **Note:** Chrome requires non-default `--user-data-dir` for remote debugging; using persistent automation profile: `~/.openclaw/chrome-cdp-profile`.

## Pending Actions

### Operator actions required (one-time)
1) **Sign into Google in the Chrome CDP automation profile once** (optional; only if browser automation is needed)
   - Chrome launched with profile: `~/.openclaw/chrome-cdp-profile`
   - Sign into Google as needed; session will persist in that profile

### Waiting-on
- Manual QA of Firebase sign-in → session cookie → Settings/Dashboard → calendar sync end-to-end.
- Decision on kelly-dashboard “show live work” vs “only show project-state.json subagents” (or enforce PL SOP to always update `project-state.json.subagents`).

### Autonomous work in progress
1) Manual QA + small fixes as needed (auth/session, Firestore persistence, calendar sync).
2) Optional: improve kelly-dashboard Project Details to join live sessions when `project-state.json` is stale/missing.

## Recent Completions

- ✅ kelly-dashboard: CollapsibleSection header fully clickable (commit `d8ec2af`)
- ✅ Supabase-only cleanup + fixes merged for `meeting-time-tracker-web` (commit `1ce0e8d`)
- ✅ Chrome CDP launcher + LaunchAgent added and fixed to use dedicated user-data-dir (commits `8316ab7`, `183a0b8`)
- ✅ meeting-time-tracker-web: Firebase-only migration packets A/B/C/D completed; merged to `main`; build passes
