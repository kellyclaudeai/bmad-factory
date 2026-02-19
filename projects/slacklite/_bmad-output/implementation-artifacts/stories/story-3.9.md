# Story 3.9: Build Invite Team Modal UI

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Create modal for inviting users via email addresses. Parse comma-separated emails, validate format, and display invite link for manual sharing with copy-to-clipboard functionality.

**Acceptance Criteria:**
- [ ] Create `components/features/workspace/InviteTeamModal.tsx`
- [ ] Trigger: "Invite Team" button in sidebar
- [ ] Modal content:
  - [ ] Title: "Invite Team Members" (H3)
  - [ ] Input: Textarea for emails (placeholder: "alex@example.com, jordan@example.com")
  - [ ] Helper text: "Separate multiple emails with commas or spaces."
  - [ ] Invite link section: "Or share this invite link:" + read-only input with link + Copy button
  - [ ] Buttons: Cancel, Send Invites (Primary)
- [ ] Email validation: Parse input, check each email format, show errors for invalid
- [ ] Copy button: Copy invite link to clipboard, show "Copied!" feedback (2s)

**Dependencies:**
dependsOn: ["3.1", "1.6"]

**Technical Notes:**
- InviteTeamModal component:
  ```tsx
  import { useState } from 'react';
  import Modal from '@/components/ui/Modal';
  import Button from '@/components/ui/Button';

  export default function InviteTeamModal({ isOpen, onClose, workspaceId }) {
    const [emails, setEmails] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    const inviteLink = `https://slacklite.app/invite/${workspaceId}/${inviteToken}`;

    const parseEmails = (input: string): string[] => {
      return input.split(/[\s,]+/).filter(e => e.length > 0);
    };

    const validateEmails = (emailList: string[]) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalid = emailList.filter(email => !emailRegex.test(email));
      setErrors(invalid);
      return invalid.length === 0;
    };

    const handleCopy = async () => {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <h3 className="text-xl font-semibold mb-4">Invite Team Members</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email Addresses</label>
          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="alex@example.com, jordan@example.com"
            className="w-full p-2 border rounded min-h-[80px]"
          />
          <p className="text-gray-700 text-xs mt-2">
            Separate multiple emails with commas or spaces.
          </p>
          {errors.length > 0 && (
            <p className="text-error text-sm mt-2">
              Invalid emails: {errors.join(', ')}
            </p>
          )}
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Or share this invite link:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 p-2 border rounded bg-gray-100"
            />
            <Button variant="secondary" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSendInvites}>
            Send Invites
          </Button>
        </div>
      </Modal>
    );
  }
  ```
- Email parsing: Split by commas, spaces, or newlines
- Validation: Email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Estimated Effort:** 2 hours
