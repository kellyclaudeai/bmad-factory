"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import type { AuthError } from "firebase/auth";
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Button, Input } from "@/components/ui";
import { auth } from "@/lib/firebase/client";
import { trackAuthTime } from "@/lib/monitoring/performance";
import { syncServerSession } from "@/lib/utils/session";
import { validateEmail as validateEmailInput } from "@/lib/utils/validation";

function getSafeRedirectPath(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  if (
    normalized.length === 0 ||
    !normalized.startsWith("/") ||
    normalized.startsWith("//")
  ) {
    return null;
  }

  return normalized;
}

function getSignInErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return "Unable to sign in right now. Please try again.";
  }

  const errorCode = (error as AuthError).code;

  switch (errorCode) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password";
    case "auth/invalid-email":
      return "Invalid email address";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Unable to sign in right now. Please try again.";
  }
}

function getEmailValidationError(value: string, required = false): string {
  if (!required && value.trim().length === 0) {
    return "";
  }

  const result = validateEmailInput(value);

  if (result.valid) {
    return "";
  }

  return result.error ?? "Enter a valid email address.";
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const redirectPath = getSafeRedirectPath(searchParams.get("next"));
  const isEmailValid = validateEmailInput(email).valid;
  const canSubmit =
    !isLoading &&
    !isCheckingAuth &&
    isEmailValid &&
    password.trim().length > 0;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !isLoading) {
        router.replace(redirectPath ?? "/app");
        return;
      }

      setIsCheckingAuth(false);
    });

    return unsubscribe;
  }, [isLoading, redirectPath, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) {
      return;
    }

    const normalizedEmail = email.trim();
    const nextEmailError = getEmailValidationError(normalizedEmail, true);
    setEmailError(nextEmailError);

    if (nextEmailError) {
      return;
    }

    setErrorMessage("");
    setIsLoading(true);
    const authStartTime = Date.now();
    let authOutcome: "success" | "failure" = "failure";

    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password,
      );
      await syncServerSession(userCredential.user);
      authOutcome = "success";
      router.replace(redirectPath ?? "/app");
    } catch (error) {
      setErrorMessage(getSignInErrorMessage(error));
    } finally {
      trackAuthTime(authStartTime, Date.now(), {
        flow: "signin",
        outcome: authOutcome,
      });
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base px-4 py-10">
        <div className="w-full max-w-[400px] rounded-lg border border-border bg-surface-2 p-6 shadow-xl">
          <p className="text-center text-sm text-secondary">Checking session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-base px-4 py-10">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="font-mono text-2xl font-semibold text-accent">SlackLite</span>
          <p className="mt-2 text-sm text-secondary">Sign in to your workspace</p>
        </div>

        {/* Auth card */}
        <section className="rounded-lg border border-border bg-surface-2 p-8 shadow-xl">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            {/* Error banner */}
            {errorMessage ? (
              <div
                role="alert"
                className="rounded-md border border-error bg-error-subtle px-4 py-3 text-sm font-mono text-error"
              >
                {errorMessage}
              </div>
            ) : null}

            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrorMessage("");
                setEmailError(getEmailValidationError(event.target.value));
              }}
              autoComplete="email"
              disabled={isLoading}
              error={emailError}
              required
            />

            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={isLoading}
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </section>

        <p className="mt-6 text-center text-sm text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href={
              redirectPath
                ? `/signup?next=${encodeURIComponent(redirectPath)}`
                : "/signup"
            }
            className="text-accent transition-colors hover:text-accent-hover"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

function SignInLoadingFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base px-4 py-10">
      <div className="w-full max-w-[400px] rounded-lg border border-border bg-surface-2 p-6 shadow-xl">
        <p className="text-center text-sm text-secondary">Loading sign-in...</p>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoadingFallback />}>
      <SignInContent />
    </Suspense>
  );
}
