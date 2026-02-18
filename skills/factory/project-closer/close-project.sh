#!/bin/bash
#
# Project Closer - Complete project termination and cleanup
#
# Usage: ./close-project.sh <projectId> "<reason>"
#
# Example: ./close-project.sh fleai-market "BMAD compliance violation"

set -euo pipefail

PROJECT_ID="${1:-}"
REASON="${2:-Unspecified}"
TIMESTAMP=$(date -u +%Y-%m-%dT%H-%M-%SZ)
DATE=$(date -u +%Y-%m-%d)

WORKSPACE="/Users/austenallred/clawd"
PROJECT_DIR="$WORKSPACE/projects/$PROJECT_ID"
FACTORY_STATE="$WORKSPACE/factory-state.md"
MEMORY_FILE="$WORKSPACE/memory/$DATE.md"
SESSION_CLOSER="$WORKSPACE/skills/factory/session-closer/close-session.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}Error: Project ID required${NC}"
  echo "Usage: $0 <projectId> \"<reason>\""
  exit 1
fi

echo ""
echo "========================================="
echo "Project Closure: $PROJECT_ID"
echo "Reason: $REASON"
echo "Timestamp: $TIMESTAMP"
echo "========================================="
echo ""

# Step 1: Delete project directory
echo -e "${YELLOW}[1/4]${NC} Deleting project directory..."
if [ -d "$PROJECT_DIR" ]; then
  # Remove .git first to avoid "Directory not empty" errors
  if [ -d "$PROJECT_DIR/.git" ]; then
    rm -rf "$PROJECT_DIR/.git" 2>/dev/null || true
  fi
  
  rm -rf "$PROJECT_DIR"
  if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${GREEN}✅${NC} Project directory deleted: $PROJECT_DIR"
  else
    echo -e "${RED}❌${NC} Failed to delete project directory (continuing anyway)"
  fi
else
  echo -e "${YELLOW}⏭${NC}  Project directory doesn't exist (already deleted)"
fi

# Step 2: Close Project Lead session (delegates to session-closer)
echo ""
echo -e "${YELLOW}[2/4]${NC} Closing Project Lead session..."
SESSION_KEY="agent:project-lead:project-$PROJECT_ID"

if [ -f "$SESSION_CLOSER" ]; then
  bash "$SESSION_CLOSER" "$SESSION_KEY" "Project terminated: $REASON" || echo -e "${YELLOW}⚠${NC}  Session closer reported issues (continuing)"
else
  echo -e "${YELLOW}⚠${NC}  session-closer not found, performing manual cleanup..."
  
  # Manual session cleanup
  PL_SESSIONS="/Users/austenallred/.openclaw/agents/project-lead/sessions"
  SESSIONS_JSON="$PL_SESSIONS/sessions.json"
  
  if [ -f "$SESSIONS_JSON" ]; then
    # Use Node.js to remove session from index
    node -e "
      const fs = require('fs');
      const path = '$SESSIONS_JSON';
      const data = JSON.parse(fs.readFileSync(path, 'utf8'));
      const key = '$SESSION_KEY';
      
      if (data[key]) {
        const sessionId = data[key].sessionId;
        delete data[key];
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
        console.log('✅ Removed session from index');
        
        // Archive transcript
        const transcript = '$PL_SESSIONS/' + sessionId + '.jsonl';
        const archived = transcript + '.terminated.$TIMESTAMP';
        if (fs.existsSync(transcript)) {
          fs.renameSync(transcript, archived);
          console.log('✅ Archived transcript:', archived);
        }
      } else {
        console.log('⏭  Session not found in index');
      }
    " 2>/dev/null || echo -e "${RED}❌${NC} Manual session cleanup failed"
  fi
fi

# Step 3: Update factory-state.md
echo ""
echo -e "${YELLOW}[3/4]${NC} Updating factory-state.md..."

if [ -f "$FACTORY_STATE" ]; then
  # Create backup
  cp "$FACTORY_STATE" "$FACTORY_STATE.bak.$TIMESTAMP"
  
  # Check if project entry exists
  if grep -q "^### $PROJECT_ID\$" "$FACTORY_STATE"; then
    # Update existing entry - mark as TERMINATED
    # This is complex to do in bash, so we'll use a simple append approach
    echo "" >> "$FACTORY_STATE"
    cat >> "$FACTORY_STATE" << EOF

### $PROJECT_ID (TERMINATED)
- **Status:** ❌ **TERMINATED**
- **Termination Date:** $(date -u +"%Y-%m-%d %H:%M CST")
- **Reason:** $REASON
- **Cleanup:** Project directory deleted, session closed, artifacts removed

EOF
    echo -e "${GREEN}✅${NC} factory-state.md updated"
  else
    echo -e "${YELLOW}⏭${NC}  Project not found in factory-state.md (continuing)"
  fi
else
  echo -e "${YELLOW}⚠${NC}  factory-state.md not found (creating)"
  mkdir -p "$(dirname "$FACTORY_STATE")"
  cat > "$FACTORY_STATE" << EOF
# Factory State

**Last Updated:** $(date -u +"%Y-%m-%d %H:%M CST")

## Active Projects

(None)

## Terminated Projects

### $PROJECT_ID
- **Status:** ❌ **TERMINATED**
- **Termination Date:** $(date -u +"%Y-%m-%d %H:%M CST")
- **Reason:** $REASON
EOF
  echo -e "${GREEN}✅${NC} Created factory-state.md"
fi

# Step 4: Document in memory
echo ""
echo -e "${YELLOW}[4/4]${NC} Documenting termination in memory..."

mkdir -p "$(dirname "$MEMORY_FILE")"

cat >> "$MEMORY_FILE" << EOF

---

## Project Termination: $PROJECT_ID ($(date -u +%H:%M) CST)

**Status:** ❌ Terminated

**Reason:** $REASON

**Actions Taken:**
- ✅ Deleted project directory: $PROJECT_DIR
- ✅ Closed Project Lead session: $SESSION_KEY
- ✅ Updated factory-state.md
- ✅ Documented in memory

**Timestamp:** $TIMESTAMP

EOF

echo -e "${GREEN}✅${NC} Termination documented in memory/$DATE.md"

# Final summary
echo ""
echo "========================================="
echo -e "${GREEN}✅ Project Closure Complete: $PROJECT_ID${NC}"
echo "========================================="
echo ""
echo "Deleted:"
echo "  - Directory: $PROJECT_DIR"
echo "  - Session: $SESSION_KEY"
echo ""
echo "Updated:"
echo "  - factory-state.md"
echo "  - memory/$DATE.md"
echo ""
echo "Reason: $REASON"
echo ""
