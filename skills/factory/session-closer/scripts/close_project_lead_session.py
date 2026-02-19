#!/usr/bin/env python3

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

STATE_DIR = Path(os.path.expanduser("~/.openclaw"))


def utc_ts() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H-%M-%SZ")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--agent", default="project-lead", help="Agent name (e.g., project-lead, main)")
    ap.add_argument("--session-key", help="Full session key (e.g., agent:main:jason)")
    ap.add_argument("--project-id", help="Project ID (for project-lead sessions)")

    # Archive transcript by default (safe, preserves history)
    ap.add_argument("--archive-transcript", action="store_true", default=True)
    ap.add_argument("--no-archive-transcript", action="store_true")

    args = ap.parse_args()

    # Compute paths from agent
    sess_dir = STATE_DIR / "agents" / args.agent / "sessions"
    index_path = sess_dir / "sessions.json"

    # Determine session key candidates
    if args.session_key:
        # Full session key provided
        candidates = [args.session_key]
    elif args.project_id:
        # Project ID provided - construct session key patterns
        candidates = [
            f"agent:{args.agent}:{args.project_id}",
            f"agent:{args.agent}:project-{args.project_id}",
        ]
    else:
        print("ERROR: Must provide either --session-key or --project-id", file=sys.stderr)
        return 2

    # Load index from computed path
    if not index_path.exists():
        print(f"ERROR: Index not found at {index_path}", file=sys.stderr)
        return 1

    index = json.loads(index_path.read_text())

    session_key = next((k for k in candidates if k in index), None)
    if not session_key:
        print("NOT_FOUND " + " | ".join(candidates))
        return 0

    # Backup index
    bak = index_path.with_suffix(f".json.bak-close-{utc_ts()}")
    bak.write_text(json.dumps(index, indent=2, sort_keys=True) + "\n")

    session_id = (index.get(session_key) or {}).get("sessionId")

    # Remove from index
    del index[session_key]
    index_path.write_text(json.dumps(index, indent=2, sort_keys=True) + "\n")

    # Archive transcript
    archive = args.archive_transcript and not args.no_archive_transcript
    if archive and session_id:
        src = sess_dir / f"{session_id}.jsonl"
        if src.exists():
            dst = sess_dir / f"{session_id}.jsonl.deleted.{utc_ts()}"
            src.rename(dst)

    # Note: Gateway restart removed - sessions.json changes are picked up on next read
    # Dashboard will reflect changes within seconds (no restart needed)
    # If immediate reflection is critical, operator can manually refresh dashboard
    # Old approach: subprocess.run(["openclaw", "gateway", "restart"]) - this BREAKS gateway

    print(f"CLOSED {session_key} sessionId={session_id}")
    print("NOTE: Dashboard will reflect changes within seconds (auto-refresh)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
