# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e4]:
      - heading "Create Your Account" [level=1] [ref=e5]
      - form "Sign up form" [ref=e6]:
        - generic [ref=e8]:
          - generic [ref=e9]: Email Address
          - textbox "Email address" [ref=e10]:
            - /placeholder: you@company.com
        - generic [ref=e12]:
          - generic [ref=e13]: Password
          - textbox "Password" [ref=e14]:
            - /placeholder: "********"
        - button "Create Account" [disabled] [ref=e15]
      - paragraph [ref=e16]:
        - text: Already have an account?
        - link "Sign In" [ref=e17] [cursor=pointer]:
          - /url: /signin
  - alert [ref=e18]
```