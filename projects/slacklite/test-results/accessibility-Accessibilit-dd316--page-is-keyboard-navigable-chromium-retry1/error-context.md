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
          - generic [ref=e8]:
            - generic [ref=e9]: Email Address
            - textbox "Email address" [ref=e10]:
              - /placeholder: you@company.com
          - generic [ref=e11]:
            - generic [ref=e12]: Password
            - textbox "Password" [ref=e13]:
              - /placeholder: ••••••••
            - paragraph [ref=e14]: Minimum 8 characters
          - button "Create Account" [disabled] [ref=e15]
      - paragraph [ref=e16]:
        - text: Already have an account?
        - link "Sign in" [ref=e17] [cursor=pointer]:
          - /url: /signin
  - alert [ref=e18]
```