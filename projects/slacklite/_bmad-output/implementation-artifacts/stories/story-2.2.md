# Story 2.2: Build Sign Up Form UI

**Epic:** Epic 2 - Authentication & User Management

**Description:**
Create sign-up page with email/password form, client-side validation, and error handling UI (no backend integration yet). Accessible form with keyboard navigation and error states.

**Acceptance Criteria:**
- [x] Create `app/(auth)/signup/page.tsx` (Client Component with 'use client')
- [x] Form fields: Email (type="email"), Password (type="password", min 8 chars)
- [x] Real-time validation: Email format, password length
- [x] Error messages displayed below inputs (red border + text)
- [x] Submit button: "Create Account" (Primary button, disabled if validation fails)
- [x] Link to Sign In: "Already have an account? Sign In"
- [x] Form state managed with useState (email, password, errors, loading)
- [x] Accessible: ARIA labels, keyboard navigation (Tab, Enter to submit)
- [x] Mobile responsive (full-width form on mobile)

**Dependencies:**
dependsOn: ["1.6"]

**Technical Notes:**
- URL: `/signup`
- Client Component (needs useState): Add 'use client' directive
- Form validation (real-time):
  - Email regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
  - Password min length: 8 characters
- Error messages (Body Small, Error color):
  - "Please enter a valid email address"
  - "Password must be at least 8 characters"
- Components to use:
  - Input from components/ui/Input.tsx
  - Button from components/ui/Button.tsx
- State structure:
  ```typescript
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  ```
- Layout (from UX spec):
  - Centered card, max-width 400px, 32px padding
  - Title: H3 (20px Semibold), centered
  - Inputs: Full-width, 16px bottom margin
  - Button: Full-width, Primary variant

**Estimated Effort:** 2 hours
