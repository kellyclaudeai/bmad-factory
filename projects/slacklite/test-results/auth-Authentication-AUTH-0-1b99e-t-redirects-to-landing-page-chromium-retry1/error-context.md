# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - main [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - text: SlackLite
        - heading "Sign in" [level=1] [ref=e6]
      - generic [ref=e8]:
        - generic [ref=e9]:
          - generic [ref=e10]: Email
          - textbox "Email" [ref=e11]
        - generic [ref=e12]:
          - generic [ref=e13]: Password
          - textbox "Password" [ref=e14]
        - button "Sign in" [disabled] [ref=e15]
      - paragraph [ref=e16]:
        - text: Don't have an account?
        - link "Sign up" [ref=e17] [cursor=pointer]:
          - /url: /signup
```