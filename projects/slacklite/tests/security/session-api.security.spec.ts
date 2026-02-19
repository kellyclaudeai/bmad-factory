// @vitest-environment node

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getCsrfToken } from "@/app/api/auth/csrf/route";
import { DELETE as deleteSession, POST as createSession } from "@/app/api/auth/session/route";
import {
  CSRF_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/lib/server/security/constants";
import { __resetRateLimitStoreForTests } from "@/lib/server/security/rateLimit";

const verifyIdTokenMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/firebase-admin", () => ({
  verifyIdToken: verifyIdTokenMock,
}));

function createRequest(options: {
  method: "POST" | "DELETE";
  body?: Record<string, unknown>;
  cookie?: string;
  csrfHeader?: string;
  ipAddress?: string;
}): NextRequest {
  const headers = new Headers();

  if (options.body) {
    headers.set("content-type", "application/json");
  }

  if (options.cookie) {
    headers.set("cookie", options.cookie);
  }

  if (options.csrfHeader) {
    headers.set("x-csrf-token", options.csrfHeader);
  }

  if (options.ipAddress) {
    headers.set("x-forwarded-for", options.ipAddress);
  }

  return new NextRequest("http://localhost/api/auth/session", {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}

describe("Session API security audit", () => {
  beforeEach(() => {
    verifyIdTokenMock.mockReset();
    __resetRateLimitStoreForTests();
  });

  it("issues a CSRF token cookie and response payload", async () => {
    const response = await getCsrfToken(
      new NextRequest("http://localhost/api/auth/csrf"),
    );
    const body = (await response.json()) as { csrfToken?: unknown };

    expect(response.status).toBe(200);
    expect(typeof body.csrfToken).toBe("string");
    expect((body.csrfToken as string).length).toBeGreaterThan(20);
    expect(response.headers.get("set-cookie")).toContain(`${CSRF_COOKIE_NAME}=`);
  });

  it("rejects CSRF-missing session creation requests", async () => {
    const response = await createSession(
      createRequest({
        method: "POST",
        body: {
          idToken: "token-1",
        },
      }),
    );

    expect(response.status).toBe(403);
    expect(verifyIdTokenMock).not.toHaveBeenCalled();
  });

  it("validates input payloads for session creation", async () => {
    const csrfToken = "csrf-token-1";
    const response = await createSession(
      createRequest({
        method: "POST",
        body: {},
        cookie: `${CSRF_COOKIE_NAME}=${csrfToken}`,
        csrfHeader: csrfToken,
      }),
    );

    expect(response.status).toBe(400);
    expect(verifyIdTokenMock).not.toHaveBeenCalled();
  });

  it("creates secure session cookies for valid tokens", async () => {
    const csrfToken = "csrf-token-2";
    verifyIdTokenMock.mockResolvedValueOnce({
      uid: "user-1",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const response = await createSession(
      createRequest({
        method: "POST",
        body: {
          idToken: "valid-token",
        },
        cookie: `${CSRF_COOKIE_NAME}=${csrfToken}`,
        csrfHeader: csrfToken,
      }),
    );
    const body = (await response.json()) as { success?: boolean };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(verifyIdTokenMock).toHaveBeenCalledWith("valid-token", true);
    expect(response.headers.get("set-cookie")).toContain(`${SESSION_COOKIE_NAME}=valid-token`);
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  });

  it("returns generic auth failures without leaking internals", async () => {
    const csrfToken = "csrf-token-3";
    verifyIdTokenMock.mockRejectedValueOnce(
      new Error("FirebaseAuthError: expired at unix=12345"),
    );

    const response = await createSession(
      createRequest({
        method: "POST",
        body: {
          idToken: "invalid-token",
        },
        cookie: `${CSRF_COOKIE_NAME}=${csrfToken}`,
        csrfHeader: csrfToken,
      }),
    );
    const body = (await response.json()) as { error?: string };

    expect(response.status).toBe(401);
    expect(body.error).toBe("Invalid or expired session token.");
    expect(body.error).not.toContain("FirebaseAuthError");
  });

  it("enforces session API rate limiting", async () => {
    const csrfToken = "csrf-token-4";
    verifyIdTokenMock.mockResolvedValue({
      uid: "user-1",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const responses: Response[] = [];

    for (let index = 0; index < 21; index += 1) {
      responses.push(
        await createSession(
          createRequest({
            method: "POST",
            body: {
              idToken: `token-${index}`,
            },
            cookie: `${CSRF_COOKIE_NAME}=${csrfToken}`,
            csrfHeader: csrfToken,
            ipAddress: "10.0.0.1",
          }),
        ),
      );
    }

    const finalResponse = responses[responses.length - 1];

    expect(finalResponse.status).toBe(429);
    expect(finalResponse.headers.get("retry-after")).toBeTruthy();
  });

  it("requires CSRF on session deletion and clears cookies when valid", async () => {
    const missingCsrfResponse = await deleteSession(
      createRequest({
        method: "DELETE",
      }),
    );

    expect(missingCsrfResponse.status).toBe(403);

    const csrfToken = "csrf-token-5";
    const validResponse = await deleteSession(
      createRequest({
        method: "DELETE",
        cookie: `${CSRF_COOKIE_NAME}=${csrfToken}; ${SESSION_COOKIE_NAME}=token-1`,
        csrfHeader: csrfToken,
      }),
    );

    expect(validResponse.status).toBe(200);
    expect(validResponse.headers.get("set-cookie")).toContain(`${SESSION_COOKIE_NAME}=;`);
    expect(validResponse.headers.get("set-cookie")).toContain(`${CSRF_COOKIE_NAME}=;`);
  });
});

