# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - text: SlackLite
        - heading "Create your account" [level=1] [ref=e5]
      - region "Sign up form" [ref=e6]:
        - form "Sign up form" [ref=e7]:
          - alert [ref=e8]: Sign up failed. Please try again.
          - generic [ref=e9]:
            - generic [ref=e10]: Email Address
            - textbox "Email address" [ref=e11]:
              - /placeholder: you@company.com
              - text: msg-durable-1771582329595-m54l5@slacklite-e2e.dev
          - generic [ref=e12]:
            - generic [ref=e13]: Password
            - textbox "Password" [ref=e14]:
              - /placeholder: ••••••••
              - text: Playwright#2026!
            - paragraph [ref=e15]: Minimum 8 characters
          - button "Create Account" [ref=e16] [cursor=pointer]
      - paragraph [ref=e17]:
        - text: Already have an account?
        - link "Sign in" [ref=e18] [cursor=pointer]:
          - /url: /signin
  - alert [ref=e19]
```