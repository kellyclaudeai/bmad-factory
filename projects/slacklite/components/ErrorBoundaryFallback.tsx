"use client";

import { Button } from "./ui/Button";

interface ErrorBoundaryFallbackProps {
  onRetry: () => void;
  title?: string;
  description?: string;
}

export function ErrorBoundaryFallback({
  onRetry,
  title = "Something went wrong",
  description = "We hit an unexpected problem. Please try again.",
}: ErrorBoundaryFallbackProps) {
  return (
    <section
      role="alert"
      className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center rounded-lg border border-gray-300 bg-white p-8 text-center shadow-sm"
    >
      <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
      <p className="mt-3 text-base text-gray-700">{description}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={onRetry}>Try Again</Button>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </div>
    </section>
  );
}
