import { randomBytes, timingSafeEqual } from "node:crypto";
import { CSRF_COOKIE_NAME } from "@/lib/server/security/constants";

export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export function tokensMatch(expected: string, received: string): boolean {
  if (!expected || !received) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function readCsrfTokenFromRequest(request: Request): string {
  const csrfHeaderValue = request.headers.get("x-csrf-token");

  if (typeof csrfHeaderValue !== "string") {
    return "";
  }

  return csrfHeaderValue.trim();
}

export function readCsrfTokenCookie(request: {
  cookies: {
    get: (name: string) => { value?: string } | undefined;
  };
}): string {
  const cookieValue = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (typeof cookieValue !== "string") {
    return "";
  }

  return cookieValue.trim();
}

