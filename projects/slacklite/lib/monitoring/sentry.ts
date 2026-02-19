import type { Event, EventHint } from "@sentry/nextjs";

const NETWORK_ERROR_PATTERNS = [
  /NetworkError/i,
  /Failed to fetch/i,
  /Network request failed/i,
  /Load failed/i,
];

const SENSITIVE_REQUEST_FIELDS = [
  "password",
  "pass",
  "token",
  "accessToken",
  "refreshToken",
];

function hasNetworkError(message: string): boolean {
  return NETWORK_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

function isNetworkError(event: Event, hint?: EventHint): boolean {
  const exceptionValue = event.exception?.values?.[0];
  const exceptionType = exceptionValue?.type ?? "";
  const exceptionMessage = exceptionValue?.value ?? event.message ?? "";

  if (exceptionType === "NetworkError" || hasNetworkError(exceptionMessage)) {
    return true;
  }

  const originalException = hint?.originalException;
  if (originalException instanceof Error) {
    if (originalException.name === "NetworkError") {
      return true;
    }

    if (hasNetworkError(originalException.message)) {
      return true;
    }
  }

  return false;
}

function sanitizeRequestData(event: Event): void {
  const requestData = event.request?.data;
  if (!requestData || typeof requestData !== "object" || Array.isArray(requestData)) {
    return;
  }

  const sanitizedData = { ...(requestData as Record<string, unknown>) };
  for (const key of SENSITIVE_REQUEST_FIELDS) {
    if (key in sanitizedData) {
      delete sanitizedData[key];
    }
  }

  if (event.request) {
    event.request.data = sanitizedData;
  }
}

export function getSentryEnvironment(): string {
  return (
    process.env.SENTRY_ENVIRONMENT ??
    process.env.NEXT_PUBLIC_VERCEL_ENV ??
    process.env.VERCEL_ENV ??
    process.env.NODE_ENV ??
    "development"
  );
}

export function getSentryRelease(): string | undefined {
  return (
    process.env.SENTRY_RELEASE ??
    process.env.NEXT_PUBLIC_SENTRY_RELEASE ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.GITHUB_SHA
  );
}

export function sentryBeforeSend<TEvent extends Event>(
  event: TEvent,
  hint?: EventHint,
): TEvent | null {
  if (isNetworkError(event, hint)) {
    return null;
  }

  if (event.user?.email) {
    delete event.user.email;
  }

  sanitizeRequestData(event);

  return event;
}
