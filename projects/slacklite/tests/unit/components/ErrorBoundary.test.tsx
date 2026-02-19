import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "../../../components/ErrorBoundary";

const { captureExceptionMock } = vi.hoisted(() => ({
  captureExceptionMock: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: captureExceptionMock,
}));

function ThrowError() {
  throw new Error("Sentry test error");
}

describe("ErrorBoundary", () => {
  afterEach(() => {
    captureExceptionMock.mockClear();
  });

  it("renders fallback UI and reports to Sentry when a child throws", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole("heading", { name: /something went wrong/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /try again/i }),
    ).toBeInTheDocument();
    expect(captureExceptionMock).toHaveBeenCalledTimes(1);

    consoleErrorSpy.mockRestore();
  });
});
