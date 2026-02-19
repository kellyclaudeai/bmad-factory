"use client";

import * as Sentry from "@sentry/nextjs";
import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { ErrorBoundaryFallback } from "./ErrorBoundaryFallback";

type ErrorFallbackRenderer = (props: {
  error: Error | null;
  reset: () => void;
}) => ReactNode;

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ErrorFallbackRenderer;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          reset: this.resetErrorBoundary,
        });
      }

      return <ErrorBoundaryFallback onRetry={this.resetErrorBoundary} />;
    }

    return this.props.children;
  }
}
