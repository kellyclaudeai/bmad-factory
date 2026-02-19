# Story 2.8: Implement Protected Route Middleware

**Epic:** Epic 2 - Authentication & User Management

**Description:**
Add Next.js middleware to protect `/app/*` routes. Verify Firebase Auth token on server-side, redirect unauthenticated users to sign-in with proper session validation.

**Acceptance Criteria:**
- [ ] Create `middleware.ts` in project root
- [ ] Middleware runs on `/app/*` paths (matcher config)
- [ ] Check for Firebase Auth token in cookies
- [ ] Verify token using Firebase Admin SDK: `verifyIdToken(token)`
- [ ] If valid: Allow request, attach user ID to request headers
- [ ] If invalid: Redirect to `/signin`
- [ ] If no token: Redirect to `/signin`
- [ ] Token refresh handled automatically by Firebase SDK

**Dependencies:**
dependsOn: ["2.5"]

**Technical Notes:**
- Middleware implementation (middleware.ts):
  ```typescript
  import { NextRequest, NextResponse } from 'next/server';
  import { verifyIdToken } from '@/lib/firebase-admin';

  export async function middleware(request: NextRequest) {
    const token = request.cookies.get('firebaseToken')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    try {
      const decodedToken = await verifyIdToken(token);
      
      // Attach user ID to request headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decodedToken.uid);

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch (error) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }

  export const config = {
    matcher: '/app/:path*',
  };
  ```
- Firebase Admin SDK setup (lib/firebase-admin.ts):
  ```typescript
  import { initializeApp, getApps, cert } from 'firebase-admin/app';
  import { getAuth } from 'firebase-admin/auth';

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }

  export const adminAuth = getAuth();
  export const verifyIdToken = (token: string) => adminAuth.verifyIdToken(token);
  ```
- Environment variables (server-side only):
  - FIREBASE_PROJECT_ID
  - FIREBASE_CLIENT_EMAIL
  - FIREBASE_PRIVATE_KEY

**Estimated Effort:** 2 hours
