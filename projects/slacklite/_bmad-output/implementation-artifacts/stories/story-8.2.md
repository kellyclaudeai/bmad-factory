# Story 8.2: Optimize Message Input for Mobile

**Epic:** Epic 8 - Mobile Responsiveness

**Description:**
Adjust message input for mobile: Larger textarea, optimized for virtual keyboard, send button always visible with proper touch targets.

**Acceptance Criteria:**
- [x] Mobile (<768px): Textarea min height 60px (larger than desktop)
- [x] Virtual keyboard triggers on tap (autofocus disabled on mobile to prevent auto-open)
- [x] Textarea expands to 60% of screen height when focused (keyboard visible)
- [x] Send button: Always visible on mobile (not hidden when empty)
- [x] Send button: 44x44px tap target (touch-friendly)
- [x] No keyboard shortcuts on mobile (Enter always sends, no Shift+Enter for new line)
- [x] Character counter: Visible above textarea (not below, to stay visible with keyboard)

**Dependencies:**
dependsOn: ["4.2"]

**Technical Notes:**
- Mobile-optimized MessageInput:
  ```tsx
  import { useState, useEffect } from 'react';

  export default function MessageInput({ onSend }) {
    const [text, setText] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      setIsMobile(window.innerWidth < 768);
    }, []);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMobile) {
        // Mobile: Enter always sends (no Shift+Enter)
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSend();
        }
      } else {
        // Desktop: Shift+Enter for new line
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      }
    };

    return (
      <div className="border-t-2 border-gray-300 p-4">
        {/* Character counter (above input on mobile) */}
        {text.length > 3900 && (
          <p className={`text-sm mb-2 ${text.length > 4000 ? 'text-error' : 'text-gray-700'}`}>
            {text.length} / 4000
          </p>
        )}

        <div className="flex gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className={`
              flex-1 p-3 border-2 border-gray-500 rounded-lg resize-none
              ${isMobile ? 'min-h-[60px]' : 'min-h-[44px]'}
              focus:h-[60vh] lg:focus:h-auto
            `}
            rows={1}
          />
          <button
            onClick={handleSend}
            className="w-11 h-11 lg:w-auto lg:h-auto lg:px-5 lg:py-2.5 bg-primary-brand text-white rounded"
            disabled={text.trim().length === 0 || text.length > 4000}
          >
            {isMobile ? '→' : 'Send'}
          </button>
        </div>
      </div>
    );
  }
  ```
- Mobile-specific behaviors:
  - Larger tap targets (44x44px minimum)
  - Textarea expands to 60% screen height when focused (to maximize visible area with keyboard)
  - Send button always visible (icon only on mobile: "→")
  - No Shift+Enter behavior on mobile

**Estimated Effort:** 2 hours
