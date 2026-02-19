import { NextRequest, NextResponse } from "next/server";
import {
  CSRF_COOKIE_NAME,
  CSRF_TOKEN_MAX_AGE_SECONDS,
  IS_PRODUCTION,
} from "@/lib/server/security/constants";
import { generateCsrfToken } from "@/lib/server/security/csrf";
import {
  checkRateLimit,
  getClientIpAddress,
} from "@/lib/server/security/rateLimit";

const CSRF_RATE_LIMIT_MAX = 60;
const CSRF_RATE_LIMIT_WINDOW_MS = 60_000;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const ipAddress = getClientIpAddress(request);
  const rateLimitResult = checkRateLimit({
    key: `csrf:${ipAddress}`,
    max: CSRF_RATE_LIMIT_MAX,
    windowMs: CSRF_RATE_LIMIT_WINDOW_MS,
  });

  if (!rateLimitResult.allowed) {
    const rateLimitedResponse = NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
    rateLimitedResponse.headers.set(
      "Retry-After",
      String(rateLimitResult.retryAfterSeconds),
    );
    return rateLimitedResponse;
  }

  const csrfToken = generateCsrfToken();
  const response = NextResponse.json(
    {
      csrfToken,
    },
    { status: 200 },
  );

  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: csrfToken,
    httpOnly: true,
    sameSite: "strict",
    secure: IS_PRODUCTION,
    path: "/",
    maxAge: CSRF_TOKEN_MAX_AGE_SECONDS,
  });
  response.headers.set("Cache-Control", "no-store");

  return response;
}

