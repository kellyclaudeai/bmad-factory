"use client";

import type { User } from "firebase/auth";

interface CsrfResponseBody {
  csrfToken?: unknown;
}

let cachedCsrfToken = "";

function parseCsrfToken(body: CsrfResponseBody | null | undefined): string {
  if (!body || typeof body.csrfToken !== "string") {
    return "";
  }

  return body.csrfToken.trim();
}

async function fetchCsrfToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedCsrfToken.length > 0) {
    return cachedCsrfToken;
  }

  const csrfResponse = await fetch("/api/auth/csrf", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!csrfResponse.ok) {
    throw new Error("Unable to initialize request validation.");
  }

  const responseBody = (await csrfResponse.json()) as CsrfResponseBody;
  const csrfToken = parseCsrfToken(responseBody);

  if (csrfToken.length === 0) {
    throw new Error("Unable to initialize request validation.");
  }

  cachedCsrfToken = csrfToken;
  return csrfToken;
}

async function postSessionToken(idToken: string, csrfToken: string): Promise<Response> {
  return fetch("/api/auth/session", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      "x-csrf-token": csrfToken,
    },
    body: JSON.stringify({ idToken }),
  });
}

async function deleteSessionToken(csrfToken: string): Promise<Response> {
  return fetch("/api/auth/session", {
    method: "DELETE",
    credentials: "include",
    cache: "no-store",
    headers: {
      "x-csrf-token": csrfToken,
    },
  });
}

export async function syncServerSession(user: User): Promise<void> {
  const idToken = await user.getIdToken();

  if (idToken.trim().length === 0) {
    throw new Error("Unable to establish server session.");
  }

  const csrfToken = await fetchCsrfToken();
  let sessionResponse = await postSessionToken(idToken, csrfToken);

  if (sessionResponse.status === 403) {
    const refreshedCsrfToken = await fetchCsrfToken(true);
    sessionResponse = await postSessionToken(idToken, refreshedCsrfToken);
  }

  if (!sessionResponse.ok) {
    throw new Error("Unable to establish server session.");
  }
}

export async function clearServerSession(): Promise<void> {
  let csrfToken = cachedCsrfToken;

  if (csrfToken.length === 0) {
    try {
      csrfToken = await fetchCsrfToken();
    } catch {
      cachedCsrfToken = "";
      return;
    }
  }

  const clearResponse = await deleteSessionToken(csrfToken);

  if (clearResponse.status === 403) {
    try {
      const refreshedCsrfToken = await fetchCsrfToken(true);
      await deleteSessionToken(refreshedCsrfToken);
    } catch {
      // Best effort cleanup.
    }
  }

  cachedCsrfToken = "";
}

