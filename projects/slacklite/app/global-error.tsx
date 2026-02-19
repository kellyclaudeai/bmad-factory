"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorBoundaryFallback } from "@/components/ErrorBoundaryFallback";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-gray-100 p-4 sm:p-8">
        <ErrorBoundaryFallback
          onRetry={reset}
          title="Unexpected application error"
          description="Please retry. If the issue persists, reload the page."
        />
      </body>
    </html>
  );
}
