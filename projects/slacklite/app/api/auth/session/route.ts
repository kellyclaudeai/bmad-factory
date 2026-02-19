import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase-admin";
import {
  CSRF_COOKIE_NAME,
  IS_PRODUCTION,
  SESSION_COOKIE_NAME,
  SESSION_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/server/security/constants";
import {
  readCsrfTokenCookie,
  readCsrfTokenFromRequest,
  tokensMatch,
} from "@/lib/server/security/csrf";
import {
  checkRateLimit,
  getClientIpAddress,
} from "@/lib/server/security/rateLimit";

const SESSION_RATE_LIMIT_MAX = 20;
const SESSION_RATE_LIMIT_WINDOW_MS = 60_000;

interface SessionRequestBody {
  idToken?: unknown;
}

function buildRateLimitKey(request: NextRequest, action: "create" | "destroy"): string {
  const ipAddress = getClientIpAddress(request);
  return `session:${action}:${ipAddress}`;
}

function validateCsrf(request: NextRequest): boolean {
  const headerToken = readCsrfTokenFromRequest(request);
  const cookieToken = readCsrfTokenCookie(request);
  return tokensMatch(cookieToken, headerToken);
}

function denyInvalidCsrf(): NextResponse {
  return NextResponse.json(
    { error: "Request validation failed." },
    { status: 403 },
  );
}

function denyRateLimited(retryAfterSeconds: number): NextResponse {
  const response = NextResponse.json(
    { error: "Too many requests. Please try again shortly." },
    { status: 429 },
  );
  response.headers.set("Retry-After", String(retryAfterSeconds));
  return response;
}

function clearSessionCookies(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PRODUCTION,
  });
  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: IS_PRODUCTION,
  });
}

function getSessionCookieMaxAgeSeconds(tokenExpiryUnixSeconds: number): number {
  const nowUnixSeconds = Math.floor(Date.now() / 1000);
  const secondsUntilExpiry = tokenExpiryUnixSeconds - nowUnixSeconds;
  const boundedLifetime = Math.min(secondsUntilExpiry, SESSION_TOKEN_MAX_AGE_SECONDS);

  return Math.max(boundedLifetime, 0);
}

function ensureJsonObject(value: unknown): SessionRequestBody | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as SessionRequestBody;
}

function parseIdToken(requestBody: SessionRequestBody | null): string {
  if (!requestBody || typeof requestBody.idToken !== "string") {
    return "";
  }

  return requestBody.idToken.trim();
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rateLimitResult = checkRateLimit({
    key: buildRateLimitKey(request, "create"),
    max: SESSION_RATE_LIMIT_MAX,
    windowMs: SESSION_RATE_LIMIT_WINDOW_MS,
  });

  if (!rateLimitResult.allowed) {
    return denyRateLimited(rateLimitResult.retryAfterSeconds);
  }

  if (!validateCsrf(request)) {
    return denyInvalidCsrf();
  }

  let parsedBody: unknown;

  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const idToken = parseIdToken(ensureJsonObject(parsedBody));

  if (idToken.length === 0) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  try {
    const decodedToken = await verifyIdToken(idToken, true);
    const maxAge = getSessionCookieMaxAgeSeconds(decodedToken.exp);

    if (maxAge <= 0) {
      return NextResponse.json(
        { error: "Invalid or expired session token." },
        { status: 401 },
      );
    }

    const response = NextResponse.json(
      { success: true },
      { status: 200 },
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: idToken,
      maxAge,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: IS_PRODUCTION,
    });
    response.headers.set("Cache-Control", "no-store");

    return response;
  } catch {
    const unauthorizedResponse = NextResponse.json(
      { error: "Invalid or expired session token." },
      { status: 401 },
    );
    clearSessionCookies(unauthorizedResponse);
    return unauthorizedResponse;
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const rateLimitResult = checkRateLimit({
    key: buildRateLimitKey(request, "destroy"),
    max: SESSION_RATE_LIMIT_MAX,
    windowMs: SESSION_RATE_LIMIT_WINDOW_MS,
  });

  if (!rateLimitResult.allowed) {
    return denyRateLimited(rateLimitResult.retryAfterSeconds);
  }

  if (!validateCsrf(request)) {
    return denyInvalidCsrf();
  }

  const response = NextResponse.json({ success: true }, { status: 200 });
  clearSessionCookies(response);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

