"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import type { AuthError } from "firebase/auth";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { Button, Input } from "@/components/ui";
import { auth, firestore } from "@/lib/firebase/client";
import { trackAuthTime } from "@/lib/monitoring/performance";
import { validateEmail as validateEmailInput } from "@/lib/utils/validation";

const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_ERROR_MESSAGE = "Password must be at least 8 characters";
const DEFAULT_SIGNUP_ERROR_MESSAGE = "Sign up failed. Please try again.";

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

const validateEmailField = (value: string, required = false): string => {
  if (!required && value.trim().length === 0) {
    return "";
  }

  const result = validateEmailInput(value);

  if (result.valid) {
    return "";
  }

  return result.error ?? "Enter a valid email address.";
};

const validatePassword = (value: string): string => {
  if (!value) {
    return "";
  }

  return value.length >= MIN_PASSWORD_LENGTH ? "" : PASSWORD_ERROR_MESSAGE;
};

function getSignUpErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return DEFAULT_SIGNUP_ERROR_MESSAGE;
  }

  const errorCode = (error as AuthError).code;

  switch (errorCode) {
    case "auth/email-already-in-use":
      return "Email already in use. Sign in instead?";
    case "auth/weak-password":
      return "Password is too weak";
    case "auth/invalid-email":
      return "Invalid email address";
    default:
      return DEFAULT_SIGNUP_ERROR_MESSAGE;
  }
}

function deriveDisplayName(email: string): string {
  return email.split("@")[0] ?? "";
}

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const redirectPath = getSafeRedirectPath(searchParams.get("next"));

  const emailIsValid = validateEmailInput(email).valid;
  const passwordIsValid = password.length >= MIN_PASSWORD_LENGTH;
  const canSubmit = emailIsValid && passwordIsValid && !loading;

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setErrorMessage("");
    setErrors((current) => ({
      ...current,
      email: validateEmailField(value),
    }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrorMessage("");
    setErrors((current) => ({
      ...current,
      password: validatePassword(value),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) {
      return;
    }

    const normalizedEmail = email.trim();

    const nextErrors = {
      email: validateEmailField(normalizedEmail, true),
      password: validatePassword(password),
    };
    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    setErrorMessage("");
    setLoading(true);
    const authStartTime = Date.now();
    let authOutcome: "success" | "failure" = "failure";

    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password,
      );
      const firebaseUser = userCredential.user;

      await setDoc(doc(firestore, "users", firebaseUser.uid), {
        userId: firebaseUser.uid,
        email: firebaseUser.email ?? normalizedEmail,
        displayName: deriveDisplayName(normalizedEmail),
        workspaceId: null,
        createdAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
        isOnline: false,
      });

      authOutcome = "success";
      router.replace(redirectPath ?? "/create-workspace?new=1");
    } catch (error) {
      setErrorMessage(getSignUpErrorMessage(error));
    } finally {
      trackAuthTime(authStartTime, Date.now(), {
        flow: "signup",
        outcome: authOutcome,
      });
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-base px-4 py-10">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="font-mono text-2xl font-semibold text-accent">SlackLite</span>
          <p className="mt-2 text-sm text-secondary">Create Account</p>
        </div>

        {/* Auth card */}
        <section
          className="rounded-lg border border-border bg-surface-2 p-8 shadow-xl"
          aria-label="Sign up form"
        >
          <h1 className="mb-4 text-xl font-semibold text-primary">Create Account</h1>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            aria-label="Sign up form"
            noValidate
          >
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
              id="signup-email"
              type="email"
              label="Email Address"
              placeholder="you@company.com"
              autoComplete="email"
              value={email}
              onChange={(event) => handleEmailChange(event.target.value)}
              error={errors.email}
              aria-label="Email address"
              disabled={loading}
            />

            <Input
              id="signup-password"
              type="password"
              label="Password"
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              helperText="Minimum 8 characters"
              value={password}
              onChange={(event) => handlePasswordChange(event.target.value)}
              error={errors.password}
              aria-label="Password"
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              disabled={!canSubmit}
              className="w-full"
              aria-label="Create Account"
            >
              {loading ? (
                <>
                  <span
                    aria-hidden="true"
                    className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-inverse/80 border-t-transparent"
                  />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </section>

        <p className="mt-6 text-center text-sm text-secondary">
          Already have an account?{" "}
          <Link
            href={
              redirectPath
                ? `/signin?next=${encodeURIComponent(redirectPath)}`
                : "/signin"
            }
            className="underline text-accent transition-colors hover:text-accent-hover"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

function SignUpLoadingFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base px-4 py-10">
      <div className="w-full max-w-[400px] rounded-lg border border-border bg-surface-2 p-8 shadow-xl">
        <p className="text-center text-sm text-secondary">Loading sign-up...</p>
      </div>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpLoadingFallback />}>
      <SignUpContent />
    </Suspense>
  );
}
