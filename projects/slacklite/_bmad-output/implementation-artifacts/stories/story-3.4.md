# Story 3.4: Build Create Channel Modal UI

**Epic:** Epic 3 - Workspace & Channel Management

**Description:**
Create modal for adding new channels with name validation (lowercase, hyphens only, no spaces). Accessible keyboard navigation, focus trap, and real-time input formatting.

**Acceptance Criteria:**
- [ ] Create `components/features/channels/CreateChannelModal.tsx`
- [ ] Trigger: "+ New Channel" button in sidebar
- [ ] Modal content:
  - [ ] Title: "Create a Channel" (H3)
  - [ ] Input: Text field with `#` prefix (non-editable), placeholder="channel-name"
  - [ ] Helper text: "Lowercase, no spaces. Use - for multiple words."
  - [ ] Buttons: Cancel (Secondary), Create (Primary, disabled if invalid)
- [ ] Validation: Real-time, lowercase only, hyphens allowed, 1-50 chars
- [ ] Auto-format: Convert spaces to hyphens, uppercase to lowercase
- [ ] Error states: Show red border + error message if invalid
- [ ] Focus trap: Tab cycles through input and buttons
- [ ] ESC key closes modal

**Dependencies:**
dependsOn: ["3.1", "1.6"]

**Technical Notes:**
- CreateChannelModal component:
  ```tsx
  import { useState } from 'react';
  import Modal from '@/components/ui/Modal';
  import Input from '@/components/ui/Input';
  import Button from '@/components/ui/Button';

  export default function CreateChannelModal({ isOpen, onClose, onCreate }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleNameChange = (value: string) => {
      // Auto-format: lowercase, spaces to hyphens
      const formatted = value.toLowerCase().replace(/\s+/g, '-');
      setName(formatted);

      // Validation
      if (!/^[a-z0-9-]*$/.test(formatted)) {
        setError('Use only lowercase letters, numbers, and hyphens');
      } else if (formatted.length > 50) {
        setError('Channel name must be 50 characters or less');
      } else {
        setError('');
      }
    };

    const isValid = name.length > 0 && name.length <= 50 && /^[a-z0-9-]+$/.test(name);

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <h3 className="text-xl font-semibold mb-4">Create a Channel</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Name</label>
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">#</span>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="channel-name"
              error={!!error}
              autoFocus
            />
          </div>
          {error && <p className="text-error text-sm mt-1">{error}</p>}
          <p className="text-gray-700 text-xs mt-2">
            Lowercase, no spaces. Use - for multiple words.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onCreate(name)} disabled={!isValid}>
            Create
          </Button>
        </div>
      </Modal>
    );
  }
  ```
- Modal component (components/ui/Modal.tsx) - use from Story 1.6
- Focus trap: Modal component handles Tab cycling
- ESC key handler: Modal component closes on Escape

**Estimated Effort:** 2 hours
