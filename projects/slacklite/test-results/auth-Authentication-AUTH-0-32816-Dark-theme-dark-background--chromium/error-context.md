# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - text: SlackLite
        - paragraph [ref=e5]: Sign in to your workspace
      - generic [ref=e7]:
        - generic [ref=e8]:
          - generic [ref=e9]: Email
          - textbox "Email" [ref=e10]
        - generic [ref=e11]:
          - generic [ref=e12]: Password
          - textbox "Password" [ref=e13]
        - button "Sign in" [disabled] [ref=e14]
      - paragraph [ref=e15]:
        - text: Don't have an account?
        - link "Sign up" [ref=e16] [cursor=pointer]:
          - /url: /signup
  - alert [ref=e17]
```