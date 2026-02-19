"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import type { AuthError } from "firebase/auth";
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Button, Input } from "@/components/ui";
import { auth } from "@/lib/firebase/client";

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

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const redirectPath = getSafeRedirectPath(searchParams.get("next"));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace(redirectPath ?? "/app");
        return;
      }

      setIsCheckingAuth(false);
    });

    return unsubscribe;
  }, [redirectPath, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) {
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace(redirectPath ?? "/app");
    } catch (error) {
      setErrorMessage(getSignInErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
        <div className="w-full max-w-[400px] rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
          <p className="text-center text-sm text-gray-700">Checking session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <section className="w-full max-w-[400px] rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Sign In</h1>
        <p className="mt-2 text-sm text-gray-700">
          Enter your email and password to continue.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            disabled={isLoading}
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

          {errorMessage ? (
            <p
              role="alert"
              className="rounded border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
            >
              {errorMessage}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isCheckingAuth}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-700">
          Don&apos;t have an account?{" "}
          <Link
            href={
              redirectPath
                ? `/signup?next=${encodeURIComponent(redirectPath)}`
                : "/signup"
            }
            className="font-medium text-primary-brand transition-colors hover:text-primary-light"
          >
            Sign Up
          </Link>
        </p>
      </section>
    </main>
  );
}
