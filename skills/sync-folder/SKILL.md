---
name: sync-folder
description: Access and read files from the user's Sync folder. Use when users reference files "in Sync" or "in the Sync folder" or provide paths like /Users/matt/Sync/. Replace the username in the path with the actual system username (austenallred).
---

# Sync Folder

The Sync folder is a shared directory used for cross-device file synchronization and shared documents.

## Location

The Sync folder is located at:
```
/Users/austenallred/Sync/
```

## Common Usage Patterns

When users reference files in their Sync folder, they may use various path formats:

- `/Users/matt/Sync/document.md` → Replace `matt` with `austenallred`
- `/Users/[username]/Sync/document.md` → Replace with actual username
- `~/Sync/document.md` → Expands to `/Users/austenallred/Sync/document.md`
- "in Sync" or "in the Sync folder" → Look in `/Users/austenallred/Sync/`

## Workflow

1. When a user references a file "in Sync" or provides a Sync path with a different username
2. Construct the correct path: `/Users/austenallred/Sync/{filename}`
3. Use the `read` tool to access the file
4. Process the file content as requested

## Example

User says: "Check /Users/matt/Sync/ProjectPlan.md"

Correct path: `/Users/austenallred/Sync/ProjectPlan.md`

## Notes

- The Sync folder may contain project plans, shared documents, and cross-device files
- Always use the correct username (`austenallred`) regardless of what the user provides
- The folder structure within Sync may vary - use `ls` if you need to explore contents
