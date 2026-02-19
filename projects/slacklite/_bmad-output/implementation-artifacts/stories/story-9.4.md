# Story 9.4: Add Rate Limiting for Message Sending

**Epic:** Epic 9 - Security & Validation

**Description:**
Implement client-side rate limiting for message sending to prevent spam. Limit users to max 10 messages per 10 seconds with visual feedback.

**Acceptance Criteria:**
- [x] Rate limit: Max 10 messages per 10 seconds per user
- [x] Client-side enforcement: Disable send button if limit reached
- [x] Visual feedback: Show error message "Slow down! Max 10 messages per 10 seconds."
- [x] Reset timer: After 10 seconds, limit resets
- [x] Track message count: Use in-memory queue (no persistence needed)
- [x] Server-side enforcement (Phase 2): Cloud Functions validate rate limit — deferred to Phase 2 by story scope
- [x] Test: Send 11 messages rapidly → 11th blocked

**Dependencies:**
dependsOn: ["4.4"]

**Technical Notes:**
- Rate limiting logic:
  ```typescript
  export function useRateLimit(maxMessages = 10, windowMs = 10000) {
    const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);

    const canSendMessage = (): boolean => {
      const now = Date.now();
      const recentMessages = messageTimestamps.filter(ts => now - ts < windowMs);
      return recentMessages.length < maxMessages;
    };

    const recordMessage = () => {
      const now = Date.now();
      setMessageTimestamps(prev => [...prev.filter(ts => now - ts < windowMs), now]);
    };

    return { canSendMessage, recordMessage };
  }
  ```
- Use in MessageInput:
  ```tsx
  export default function MessageInput({ onSend }) {
    const [text, setText] = useState('');
    const [rateLimitError, setRateLimitError] = useState('');
    const { canSendMessage, recordMessage } = useRateLimit();

    const handleSend = async () => {
      if (!canSendMessage()) {
        setRateLimitError('Slow down! Max 10 messages per 10 seconds.');
        setTimeout(() => setRateLimitError(''), 3000);
        return;
      }

      recordMessage();
      await onSend(text);
      setText('');
    };

    return (
      <div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={handleSend} disabled={!canSendMessage()}>
          Send
        </button>
        {rateLimitError && (
          <p className="text-error text-sm mt-2">{rateLimitError}</p>
        )}
      </div>
    );
  }
  ```
- Server-side rate limiting (Phase 2 - Cloud Functions):
  ```typescript
  // Cloud Function to validate rate limit
  export const validateMessageRate = functions.firestore
    .document('workspaces/{workspaceId}/channels/{channelId}/messages/{messageId}')
    .onCreate(async (snap, context) => {
      const message = snap.data();
      const userId = message.userId;

      // Check recent messages from this user
      const recentMessages = await admin.firestore()
        .collection(`workspaces/${context.params.workspaceId}/channels/${context.params.channelId}/messages`)
        .where('userId', '==', userId)
        .where('timestamp', '>', Date.now() - 10000)
        .get();

      if (recentMessages.size > 10) {
        // Delete the message (exceeded rate limit)
        await snap.ref.delete();
        console.log(`Rate limit exceeded for user ${userId}`);
      }
    });
  ```

**Estimated Effort:** 2 hours
