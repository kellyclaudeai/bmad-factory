# Story 4.3: Implement Optimistic UI Message Sending

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Show message immediately in UI before server confirmation (optimistic rendering). Display gray "Sending..." timestamp, update to server time on confirmation with proper error handling.

**Acceptance Criteria:**
- [x] On submit: Generate temp message ID (`temp_${Date.now()}`)
- [x] Immediately add message to local state with status: 'sending', gray timestamp text
- [x] Message appears at bottom of list instantly (<50ms)
- [x] No loading spinner (optimistic UI = instant feedback)
- [x] Scroll to bottom after adding
- [x] If send succeeds: Replace temp ID with server ID, update timestamp to server time, status: 'sent'
- [x] If send fails: Show red error text "Failed to send. Retry?" + retry button

**Dependencies:**
dependsOn: ["4.2"]

**Technical Notes:**
- Optimistic message sending:
  ```tsx
  import { useState } from 'react';
  import { Timestamp } from 'firebase/firestore';

  export default function MessageList({ channelId }) {
    const [messages, setMessages] = useState<Message[]>([]);

    const handleSend = async (text: string) => {
      const tempId = `temp_${Date.now()}`;
      const { user } = useAuth();

      // 1. Optimistic UI: Show message immediately
      const tempMessage: Message = {
        messageId: tempId,
        channelId,
        workspaceId: user.workspaceId,
        userId: user.uid,
        userName: user.displayName,
        text,
        timestamp: Timestamp.now(),
        createdAt: Timestamp.now(),
        status: 'sending',
      };

      setMessages(prev => [...prev, tempMessage]);

      try {
        // 2. Send to Firebase (Story 4.4)
        const serverMessageId = await sendMessage(channelId, text);

        // 3. Update with server data
        setMessages(prev =>
          prev.map(m =>
            m.messageId === tempId
              ? { ...m, messageId: serverMessageId, status: 'sent' }
              : m
          )
        );
      } catch (error) {
        // 4. Handle failure
        setMessages(prev =>
          prev.map(m =>
            m.messageId === tempId
              ? { ...m, status: 'failed' }
              : m
          )
        );
      }
    };

    return (
      <div>
        {messages.map(message => (
          <MessageItem key={message.messageId} message={message} />
        ))}
      </div>
    );
  }
  ```
- MessageItem styling for status:
  ```tsx
  <div className={`message ${message.status === 'sending' ? 'opacity-70' : ''}`}>
    <span className={message.status === 'sending' ? 'text-gray-500' : 'text-gray-900'}>
      {message.status === 'sending' ? 'Sending...' : formatTimestamp(message.timestamp)}
    </span>
    {message.status === 'failed' && (
      <button onClick={handleRetry} className="text-error text-sm">
        Failed to send. Retry?
      </button>
    )}
  </div>
  ```
- Scroll to bottom after adding message:
  ```tsx
  useEffect(() => {
    if (messages.length > 0) {
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    }
  }, [messages]);
  ```

**Estimated Effort:** 2 hours
