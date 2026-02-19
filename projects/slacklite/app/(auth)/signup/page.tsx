"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_ERROR_MESSAGE = "Please enter a valid email address";
const PASSWORD_ERROR_MESSAGE = "Password must be at least 8 characters";

const validateEmail = (value: string): string => {
  if (!value) {
    return "";
  }

  return EMAIL_REGEX.test(value) ? "" : EMAIL_ERROR_MESSAGE;
};

const validatePassword = (value: string): string => {
  if (!value) {
    return "";
  }

  return value.length >= MIN_PASSWORD_LENGTH ? "" : PASSWORD_ERROR_MESSAGE;
};

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const emailIsValid = EMAIL_REGEX.test(email);
  const passwordIsValid = password.length >= MIN_PASSWORD_LENGTH;
  const canSubmit = emailIsValid && passwordIsValid && !loading;

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setErrors((current) => ({
      ...current,
      email: validateEmail(value),
    }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrors((current) => ({
      ...current,
      password: validatePassword(value),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    setLoading(true);
    try {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 500);
      });
    } finally {
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
              />
            </div>

            <div className="mb-4">
              <Input
                id="signup-password"
                type="password"
                label="Password"
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                value={password}
                onChange={(event) => handlePasswordChange(event.target.value)}
                error={errors.password}
                aria-label="Password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={!canSubmit}
              className="w-full"
              aria-label="Create Account"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-4 text-center text-base text-gray-700">
            Already have an account?{" "}
            <Link
              href="/signin"
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
