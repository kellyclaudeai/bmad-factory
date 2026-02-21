---
name: auth
description: "Standard authentication UX and implementation patterns for all factory web apps. Use whenever implementing signup, login, password reset, or account recovery — regardless of auth provider (Supabase, Firebase, NextAuth, etc.). Covers required providers (Google OAuth + email/password by default), password requirements with tooltip hints, exact error messages for every failure scenario (duplicate email, wrong password, not found, rate limit), account linking rules, recovery flow, and transactional email copy (welcome + reset). Provider-agnostic — read alongside the provider skill (supabase, firebase-cli) which handles the actual wiring."
---

# Auth Standards

Provider-agnostic. Apply to every auth flow regardless of backend.

## Defaults (unless intake overrides)

- **Two providers minimum:** Google OAuth + email/password
- **Email/password is always present** — Google is additive, never a replacement
- **No magic-link-only** unless explicitly specified in intake

## Password Requirements

Enforce: 8+ chars · 1 uppercase · 1 number · 1 special character (`!@#$%^&*`)

### Mobile-first display pattern

**Both mobile and desktop:**
- Requirements checklist appears **below the field** on focus, as a live ✓/✗ list.
- Disappears once all requirements are met.
- Reappears (with unmet items in red) on failed submit.
- No `?` icon — the inline checklist is always the pattern. Desktop has the space, use it.

**The 👁 show/hide toggle** is always inside the field's right edge, 44×44px touch target minimum.

**React implementation pattern:**
```tsx
const PASSWORD_REQUIREMENTS = [
  { id: 'length',    label: 'At least 8 characters',                   test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'At least 1 uppercase letter',             test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number',    label: 'At least 1 number',                       test: (p: string) => /\d/.test(p) },
  { id: 'special',   label: 'At least 1 special character (!@#$%^&*)', test: (p: string) => /[!@#$%^&*]/.test(p) },
]

function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="space-y-1 text-sm">
      {PASSWORD_REQUIREMENTS.map(req => {
        const met = req.test(password)
        return (
          <li key={req.id} className={`flex items-center gap-2 ${met ? 'text-green-600' : 'text-muted-foreground'}`}>
            {met ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
            {req.label}
          </li>
        )
      })}
    </ul>
  )
}

function PasswordField({ password, onChange, showRequirements }) {
  const [show, setShow] = useState(false)
  const [focused, setFocused] = useState(false)
  const allMet = PASSWORD_REQUIREMENTS.every(r => r.test(password))
  // showRequirements = true when field is focused OR submit failed
  const showList = showRequirements && !allMet

  return (
    <div>
      <label className="text-sm font-medium">Password</label>

      {/* Input with 👁 toggle inside */}
      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          value={password}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="pr-11"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-0 top-0 h-full w-11 flex items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {/* Inline checklist: shows on focus or after failed submit, hides when all met */}
      {showList && (
        <div className="mt-2">
          <PasswordChecklist password={password} />
        </div>
      )}
    </div>
  )
}
```

**Caller pattern** — track focus + submit-attempted state in the parent form:
```tsx
const [submitAttempted, setSubmitAttempted] = useState(false)
const [passwordFocused, setPasswordFocused] = useState(false)

// Pass to PasswordField:
showRequirements={passwordFocused || submitAttempted}
```

## UX Rules

1. **Never silent-fail.** Every error must surface with actionable copy.
2. **Duplicate email = suggest login.** Link them to sign in, don't just say "email taken."
3. **Show/hide password toggle** on all password inputs.
4. **"Remember me"** checkbox on login (default: checked).
5. **Autofocus** first field on load.
6. **Disable submit** while in-flight — show spinner on button.
7. **Google OAuth button** full-width above the form divider, with Google's branded icon.

## Error Copy

### Signup
| Scenario | Message |
|----------|---------|
| Email already registered | "An account with this email already exists." + link "Sign in instead →" → /login |
| Weak password | Inline checklist highlights unmet items in red (not a toast) |
| Invalid email (on blur) | "Please enter a valid email address." |
| Empty field (on submit) | "Required." |
| Network error | "Something went wrong. Please try again." |

### Login
| Scenario | Message |
|----------|---------|
| Wrong password | "Incorrect password." + link "Forgot password?" → /forgot-password |
| Email not found | "No account found with this email." + link "Sign up →" → /signup |
| Too many attempts | "Too many sign-in attempts. Try again in {N} minutes." + link "Reset your password →" |
| Google-only account (email/password attempt) | "This email is registered with Google. Sign in with Google instead." |
| Network error | "Something went wrong. Please try again." |

### Password Reset
| Scenario | Message |
|----------|---------|
| Email sent | "Check your inbox — we sent a reset link to {email}." |
| Email not found | "No account found with this email." |
| Link expired | "This reset link has expired." + link "Request a new link →" → /forgot-password |
| Link already used | "This reset link has already been used. Sign in or request a new link." |
| Success | "Password updated successfully." + link "Sign in →" → /login |

## Account Linking

If Google signup email matches an existing email/password account:
- "An account with this email already exists. Sign in with your password instead."
- Never silently create a duplicate account.

## Email Verification

Skip by default — don't add friction. Only implement if intake explicitly requires it.

## Password Recovery Flow

1. "Forgot password?" link below the password field on login
2. `/forgot-password` — email input, submit
3. Confirmation: "Check your inbox — we sent a reset link to {email}."
4. `/reset-password?token=...` — new password + confirm, same `?` tooltip requirements
5. Success: "Password updated. [Sign in →]"
6. Expired/used token: clear message + link to request again

## Transactional Emails

Provider-agnostic (Resend, SendGrid, Supabase, Firebase, etc.). Always include plain-text URL below button. One action per email.

### Verify Email *(optional — only if intake requires verification)*
**Subject:** Verify your email address
```
Hi {name},
Thanks for signing up for {App Name}. Please verify your email.
[Verify Email →] {verification_url}
Expires in 24 hours.
— The {App Name} Team
```

### Welcome
**Subject:** Welcome to {App Name} 🎉
```
Hi {name},
You're in. Here's where to start:
[Get Started →] {app_url}
Questions? Just reply to this email.
— The {App Name} Team
```

### Password Reset
**Subject:** Reset your password
```
Hi {name},
We received a request to reset your {App Name} password.
[Reset Password →] {reset_url}
Expires in 1 hour. If you didn't request this, ignore it.
— The {App Name} Team
```
