# Story 9.3: Implement Input Sanitization & Validation

**Epic:** Epic 9 - Security & Validation

**Description:**
Add client-side and server-side input validation and sanitization for all user inputs (messages, channel names, workspace names) to prevent XSS and injection attacks.

**Acceptance Criteria:**
- [ ] Sanitize message text: Remove script tags, HTML entities encoded
- [ ] Validate channel names: Lowercase, hyphens, 1-50 chars (regex validation)
- [ ] Validate workspace names: 1-50 chars, alphanumeric + spaces
- [ ] Validate email addresses: Standard email regex
- [ ] Escape user-generated content before rendering (React automatic, verify)
- [ ] Server-side validation in Firestore/RTDB security rules
- [ ] Block common XSS patterns (e.g., `<script>`, `javascript:`)
- [ ] Test: Attempt to inject XSS → blocked and sanitized

**Dependencies:**
dependsOn: ["4.2", "3.4"]

**Technical Notes:**
- Input sanitization library:
  ```bash
  pnpm add dompurify
  pnpm add --save-dev @types/dompurify
  ```
- Sanitize message text:
  ```typescript
  import DOMPurify from 'dompurify';

  export function sanitizeMessageText(text: string): string {
    // Remove script tags and sanitize HTML
    return DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      KEEP_CONTENT: true,
    });
  }
  ```
- Channel name validation:
  ```typescript
  export function validateChannelName(name: string): { valid: boolean; error?: string } {
    if (name.length < 1 || name.length > 50) {
      return { valid: false, error: 'Channel name must be 1-50 characters' };
    }

    if (!/^[a-z0-9-]+$/.test(name)) {
      return { valid: false, error: 'Use only lowercase letters, numbers, and hyphens' };
    }

    return { valid: true };
  }
  ```
- Workspace name validation:
  ```typescript
  export function validateWorkspaceName(name: string): { valid: boolean; error?: string } {
    if (name.length < 1 || name.length > 50) {
      return { valid: false, error: 'Workspace name must be 1-50 characters' };
    }

    if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
      return { valid: false, error: 'Use only letters, numbers, and spaces' };
    }

    return { valid: true };
  }
  ```
- Use in components:
  ```tsx
  const handleSendMessage = (text: string) => {
    const sanitized = sanitizeMessageText(text);
    await sendMessage(channelId, sanitized);
  };
  ```
- React rendering (automatic escaping):
  - React automatically escapes text content (no dangerouslySetInnerHTML)
  - Verify no use of dangerouslySetInnerHTML in codebase

**Estimated Effort:** 2 hours
