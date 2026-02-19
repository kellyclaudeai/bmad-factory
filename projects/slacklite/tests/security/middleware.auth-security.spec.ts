// @vitest-environment node

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyIdTokenMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/firebase-admin", () => ({
  verifyIdToken: verifyIdTokenMock,
}));

vi.mock("@/lib/server/security/constants", () => ({
  IS_PRODUCTION: true,
  SESSION_COOKIE_NAME: "firebaseToken",
}));

import { middleware } from "@/middleware";

function createAppRequest(options?: {
  cookie?: string;
  forwardedProto?: string;
  path?: string;
}): NextRequest {
  const headers = new Headers();

  if (options?.cookie) {
    headers.set("cookie", options.cookie);
  }

  if (options?.forwardedProto) {
    headers.set("x-forwarded-proto", options.forwardedProto);
  }

  const path = options?.path ?? "/app/channels/general";

  return new NextRequest(`http://localhost${path}`, {
    headers,
  });
}

describe("Authentication middleware security audit", () => {
  beforeEach(() => {
    verifyIdTokenMock.mockReset();
  });

  it("redirects unauthenticated requests to sign-in with a safe next path", async () => {
    const response = await middleware(createAppRequest());

    expect(response.headers.get("location")).toBe(
      "http://localhost/signin?next=%2Fapp%2Fchannels%2Fgeneral",
    );
  });

  it("blocks invalid token replay attempts and clears the stale cookie", async () => {
    verifyIdTokenMock.mockRejectedValueOnce(new Error("Token signature invalid"));

    const response = await middleware(
      createAppRequest({
        cookie: "firebaseToken=stolen-token",
      }),
    );

    expect(verifyIdTokenMock).toHaveBeenCalledWith("stolen-token", true);
    expect(response.headers.get("location")).toBe(
      "http://localhost/signin?next=%2Fapp%2Fchannels%2Fgeneral",
    );
    expect(response.headers.get("set-cookie")).toContain("firebaseToken=");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("rejects expired tokens the same way as other invalid tokens", async () => {
    verifyIdTokenMock.mockRejectedValueOnce(new Error("auth/id-token-expired"));

    const response = await middleware(
      createAppRequest({
        cookie: "firebaseToken=expired-token",
      }),
    );

    expect(response.headers.get("location")).toContain("/signin");
    expect(response.headers.get("set-cookie")).toContain("firebaseToken=");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("accepts valid tokens and forwards uid to downstream handlers", async () => {
    verifyIdTokenMock.mockResolvedValueOnce({
      uid: "user-1",
    });

    const response = await middleware(
      createAppRequest({
        cookie: "firebaseToken=valid-token",
      }),
    );

    expect(verifyIdTokenMock).toHaveBeenCalledWith("valid-token", true);
    expect(response.headers.get("x-middleware-request-x-user-id")).toBe("user-1");
  });

  it("enforces HTTPS by redirecting http protocol requests in production", async () => {
    const response = await middleware(
      createAppRequest({
        cookie: "firebaseToken=valid-token",
        forwardedProto: "http",
        path: "/app",
      }),
    );

    expect(response.headers.get("location")).toBe("https://localhost/app");
    expect(verifyIdTokenMock).not.toHaveBeenCalled();
  });
});

