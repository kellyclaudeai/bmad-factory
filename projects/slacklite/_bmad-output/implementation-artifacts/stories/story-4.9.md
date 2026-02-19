# Story 4.9: Add Message Character Limit Validation

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Enforce 4,000 character limit in message input. Show character count when approaching limit, prevent send if exceeded with client and server-side validation.

**Acceptance Criteria:**
- [x] Character counter: Displayed below textarea when >3900 characters
- [x] Counter text: "{count} / 4000" (Gray 700 if under, Error red if over)
- [x] Send button disabled if >4000 characters
- [x] Error message: "Message too long. Maximum 4,000 characters."
- [x] Validation before Firestore/RTDB write (client-side and server-side)
- [x] Firestore security rule enforces limit: `request.resource.data.text.size() <= 4000`

**Dependencies:**
dependsOn: ["4.2"]

**Technical Notes:**
- Character counter in MessageInput (already implemented in Story 4.2):
  ```tsx
  const isOverLimit = text.length > 4000;
  const showCounter = text.length > 3900;

  return (
    <div>
      <textarea value={text} onChange={handleChange} />
      <Button disabled={text.trim().length === 0 || isOverLimit}>Send</Button>
      {showCounter && (
        <p className={`text-sm mt-2 ${isOverLimit ? 'text-error' : 'text-gray-700'}`}>
          {text.length} / 4000
          {isOverLimit && ' - Message too long'}
        </p>
      )}
    </div>
  );
  ```
- Client-side validation (before send):
  ```typescript
  async function sendMessage(channelId: string, text: string) {
    if (text.length > 4000) {
      throw new Error('Message too long. Maximum 4,000 characters.');
    }
    // Proceed with dual-write (Story 4.4)
  }
  ```
- Firestore security rules (firestore.rules):
  ```javascript
  match /workspaces/{workspaceId}/channels/{channelId}/messages/{messageId} {
    allow create: if request.auth != null &&
                    request.resource.data.text is string &&
                    request.resource.data.text.size() > 0 &&
                    request.resource.data.text.size() <= 4000;
  }
  ```
- RTDB security rules (database.rules.json):
  ```json
  {
    "rules": {
      "messages": {
        "$workspaceId": {
          "$channelId": {
            "$messageId": {
              ".validate": "newData.child('text').val().length > 0 && newData.child('text').val().length <= 4000"
            }
          }
        }
      }
    }
  }
  ```
- Character limit rationale:
  - Firestore document size limit: 1MB
  - 4,000 chars ≈ 4-8KB (UTF-8)
  - Leaves room for metadata (timestamps, IDs, etc.)
- UI styling:
  - Counter visible when >3900 characters (approaching limit)
  - Red text when >4000 (over limit)
  - Send button disabled when over limit

**Estimated Effort:** 1 hour
