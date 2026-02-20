# Page snapshot

```yaml
- generic [ref=e1]:
  - alert [ref=e2]
  - main [ref=e3]:
    - generic [ref=e5]:
      - heading "Create Your Workspace" [level=3] [ref=e6]
      - form "Create workspace form" [ref=e7]:
        - generic [ref=e8]:
          - generic [ref=e9]: What's the name of your team or project?
          - textbox "Workspace name" [active] [ref=e10]:
            - /placeholder: e.g., Acme Inc
            - text: WS-dm-opena-17715644
          - paragraph [ref=e11]: Use only letters, numbers, and spaces.
        - button "Create Workspace" [disabled] [ref=e12]
```