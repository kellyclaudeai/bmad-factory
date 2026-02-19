# Story 1.1: Initialize Next.js Project with TypeScript

**Epic:** Epic 1 - Foundation

**Description:**
Create new Next.js 15+ project with App Router, TypeScript, and Tailwind CSS. Configure project structure following BMAD architecture conventions with proper TypeScript strict mode and design system foundation.

**Acceptance Criteria:**
- [ ] Run `npx create-next-app@latest slacklite --typescript --tailwind --app --eslint --no-src-dir` to initialize project
- [ ] Project structure includes `app/`, `components/`, `lib/`, `public/` directories
- [ ] TypeScript configured with strict mode in `tsconfig.json`
- [ ] Tailwind CSS configured with design system tokens (colors, spacing from UX spec)
- [ ] ESLint and Prettier configured for code quality
- [ ] `pnpm` set as package manager (create `pnpm-workspace.yaml`)
- [ ] Git repository initialized with `.gitignore` (node_modules, .env.local, .next)
- [ ] Development server runs: `pnpm dev` → http://localhost:3000

**Dependencies:**
dependsOn: []

**Technical Notes:**
- Next.js Version: 15.1.5+
- React Version: 19+
- TypeScript Version: 5.7+
- Tailwind CSS Version: 3.4+
- Use App Router (not Pages Router)
- Configure tailwind.config.ts with design system from UX spec:
  - Primary Brand: `#4A154B`
  - Success: `#2EB67D`
  - Error: `#E01E5A`
  - Gray scale: 900-100
- Configure tsconfig.json with strict: true
- Set up project structure:
  ```
  slacklite/
  ├── app/              # Next.js App Router
  ├── components/       # React components (ui/, features/, layout/)
  ├── lib/             # Firebase config, hooks, types, utils
  ├── public/          # Static assets
  ├── .gitignore
  ├── package.json
  ├── tsconfig.json
  └── tailwind.config.ts
  ```

**Estimated Effort:** 1 hour

## Review Follow-ups

- **Cannot be proven from repository snapshot:** the exact scaffold command (`npx create-next-app@latest slacklite --typescript --tailwind --app --eslint --no-src-dir`) cannot be verified post-hoc without setup logs/commit metadata.
- **Environment-specific runtime gap:** `pnpm dev` starts successfully but auto-switches to `http://localhost:3001` because port `3000` is already occupied by another process in this environment.
