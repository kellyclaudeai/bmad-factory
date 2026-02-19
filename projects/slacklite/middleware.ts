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

export const runtime = 'nodejs';
