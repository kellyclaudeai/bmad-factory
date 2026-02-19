This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Java 11+ (required for Firebase Emulators)
  ```bash
  # macOS (via Homebrew)
  brew install openjdk@21
  echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
  source ~/.zshrc
  ```

### Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Firebase Emulator Suite

For local development, use the Firebase Emulator Suite to run Auth, Firestore, and Realtime Database locally.

### Starting Emulators

```bash
pnpm run emulators
```

This will start:
- **Authentication Emulator**: http://127.0.0.1:9099
- **Firestore Emulator**: http://127.0.0.1:8080
- **Realtime Database Emulator**: http://127.0.0.1:9000
- **Emulator UI**: http://127.0.0.1:4000

### Emulator Data Persistence

```bash
# Export emulator data (before stopping emulators)
pnpm run emulators:export

# Start emulators with imported data
pnpm run emulators:import
```

Exported data is saved to `./emulator-data` (gitignored).

### Environment Variables

Configure your app to use emulators in `.env.local`:

```env
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
NEXT_PUBLIC_FIREBASE_DATABASE_EMULATOR_HOST=127.0.0.1:9000
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
