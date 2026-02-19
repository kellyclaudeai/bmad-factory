import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase-admin";
import { IS_PRODUCTION, SESSION_COOKIE_NAME } from "@/lib/server/security/constants";

function buildSignInUrl(request: NextRequest): URL {
  const signInUrl = new URL("/signin", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (nextPath.length > 0 && nextPath !== "/") {
    signInUrl.searchParams.set("next", nextPath);
  }

  return signInUrl;
}

function redirectToSignIn(
  request: NextRequest,
  options: { clearSessionCookie?: boolean } = {},
): NextResponse {
  const response = NextResponse.redirect(buildSignInUrl(request));

  if (options.clearSessionCookie) {
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      maxAge: 0,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: IS_PRODUCTION,
    });
  }

  return response;
}

function enforceHttps(request: NextRequest): NextResponse | null {
  if (!IS_PRODUCTION) {
    return null;
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedProto !== "http") {
    return null;
  }

  const secureUrl = request.nextUrl.clone();
  secureUrl.protocol = "https:";
  return NextResponse.redirect(secureUrl);
}

export async function middleware(request: NextRequest) {
  const httpsRedirectResponse = enforceHttps(request);

  if (httpsRedirectResponse) {
    return httpsRedirectResponse;
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return redirectToSignIn(request);
  }

  try {
    const decodedToken = await verifyIdToken(token, true);

    // Attach user ID to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decodedToken.uid);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch {
    return redirectToSignIn(request, { clearSessionCookie: true });
  }
}

export const config = {
  matcher: "/app/:path*",
};

export const runtime = "nodejs";
