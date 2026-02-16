#!/usr/bin/env python3

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

STATE_DIR = Path(os.path.expanduser("~/.openclaw"))
AGENT_ID = "project-lead"
SESS_DIR = STATE_DIR / "agents" / AGENT_ID / "sessions"
INDEX_PATH = SESS_DIR / "sessions.json"


def utc_ts() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H-%M-%SZ")


def load_index() -> dict:
    if not INDEX_PATH.exists():
        return {}
    return json.loads(INDEX_PATH.read_text())


def write_index(obj: dict) -> None:
    INDEX_PATH.write_text(json.dumps(obj, indent=2, sort_keys=True) + "\n")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--project-id", required=True, help="e.g. kelly-dashboard")

    # Defaults: archive + restart (safe and matches operator preference)
    ap.add_argument("--restart-gateway", action="store_true", default=True)
    ap.add_argument("--no-restart-gateway", action="store_true")
    ap.add_argument("--archive-transcript", action="store_true", default=True)
    ap.add_argument("--no-archive-transcript", action="store_true")

    args = ap.parse_args()

    # Support both canonical and legacy session key formats.
    candidates = [
        f"agent:{AGENT_ID}:{args.project_id}",
        f"agent:{AGENT_ID}:project-{args.project_id}",
    ]

    index = load_index()

    session_key = next((k for k in candidates if k in index), None)
    if not session_key:
        print("NOT_FOUND " + " | ".join(candidates))
        return 0

    # Backup index
    bak = INDEX_PATH.with_suffix(f".json.bak-close-{utc_ts()}")
    bak.write_text(json.dumps(index, indent=2, sort_keys=True) + "\n")

    session_id = (index.get(session_key) or {}).get("sessionId")

    # Remove from index
    del index[session_key]
    write_index(index)

    # Archive transcript
    archive = args.archive_transcript and not args.no_archive_transcript
    if archive and session_id:
        src = SESS_DIR / f"{session_id}.jsonl"
        if src.exists():
            dst = SESS_DIR / f"{session_id}.jsonl.deleted.{utc_ts()}"
            src.rename(dst)

    # Restart gateway
    restart = args.restart_gateway and not args.no_restart_gateway
    if restart:
        subprocess.run(["openclaw", "gateway", "restart"], check=False)

    print(f"CLOSED {session_key} sessionId={session_id}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
