# Story 4.2: Build Message Input Component

**Epic:** Epic 4 - Real-Time Messaging Core

**Description:**
Create textarea for message composition at bottom of channel view. Handle Enter to send, Shift+Enter for new line, character limit (4000 chars), and auto-expanding textarea.

**Acceptance Criteria:**
- [ ] Create `components/features/messages/MessageInput.tsx`
- [ ] Textarea: Min height 44px, max height 200px (then scrollable)
- [ ] Placeholder: "Type a message..."
- [ ] Auto-expanding: Grows with content (up to max height)
- [ ] Key handlers:
  - [ ] Enter: Submit message (preventDefault)
  - [ ] Shift+Enter: New line (default behavior)
- [ ] Character counter: Shows count when >3900 chars (red if >4000)
- [ ] Send button: Primary button, disabled if input empty or >4000 chars
- [ ] Input clears after send
- [ ] Focus remains in textarea after send (ready for next message)

**Dependencies:**
dependsOn: ["3.1", "1.6"]

**Technical Notes:**
- MessageInput component:
  ```tsx
  import { useState, useRef, KeyboardEvent } from 'react';
  import Button from '@/components/ui/Button';

  export default function MessageInput({ channelId, onSend }) {
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    const handleSend = () => {
      if (text.trim().length === 0 || text.length > 4000) return;
      onSend(text);
      setText('');
      textareaRef.current?.focus();
    };

    // Auto-expand textarea
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
    };

    const isOverLimit = text.length > 4000;
    const showCounter = text.length > 3900;

    return (
      <div className="border-t-2 border-gray-300 p-4">
        <div className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 p-3 border-2 border-gray-500 rounded-lg resize-none min-h-[44px] max-h-[200px]"
            rows={1}
          />
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={text.trim().length === 0 || isOverLimit}
          >
            Send
          </Button>
        </div>
        {showCounter && (
          <p className={`text-sm mt-2 ${isOverLimit ? 'text-error' : 'text-gray-700'}`}>
            {text.length} / 4000
          </p>
        )}
      </div>
    );
  }
  ```
- Keyboard handling:
  - Enter: Send message (prevent default newline)
  - Shift+Enter: Insert newline (default behavior)
- Auto-expanding textarea:
  - Set height to 'auto' first
  - Then set to scrollHeight (up to 200px max)
- Character limit: 4000 (Firestore document size consideration)

**Estimated Effort:** 2 hours
