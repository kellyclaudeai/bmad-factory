"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
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

export default function SignUpPage() {
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
      router.replace(redirectPath ?? "/create-workspace");
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
    <main className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full items-center justify-center">
        <section className="w-full rounded-lg border border-gray-300 bg-white p-8 shadow-sm sm:max-w-[400px]">
          <h1 className="text-center text-xl font-semibold text-gray-900">
            Create Your Account
          </h1>

          <form
            className="mt-6"
            onSubmit={handleSubmit}
            aria-label="Sign up form"
            noValidate
          >
            <div className="mb-4">
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
            </div>

            <div className="mb-4">
              <Input
                id="signup-password"
                type="password"
                label="Password"
                placeholder="********"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                value={password}
                onChange={(event) => handlePasswordChange(event.target.value)}
                error={errors.password}
                aria-label="Password"
                disabled={loading}
              />
            </div>

            {errorMessage ? (
              <p
                role="alert"
                className="mb-4 rounded border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
              >
                {errorMessage}
              </p>
            ) : null}

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
                    className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent"
                  />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-base text-gray-700">
            Already have an account?{" "}
            <Link
              href={
                redirectPath
                  ? `/signin?next=${encodeURIComponent(redirectPath)}`
                  : "/signin"
              }
              className="font-medium text-primary-brand hover:text-primary-light focus:outline-none focus:underline"
            >
              Sign In
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
