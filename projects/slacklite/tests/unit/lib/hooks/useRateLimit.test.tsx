import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useRateLimit } from "@/lib/hooks/useRateLimit";

describe("useRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-19T16:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to 10 messages in a 10 second window and blocks the 11th", () => {
    const { result } = renderHook(() => useRateLimit());

    expect(result.current.canSendMessage()).toBe(true);

    for (let messageIndex = 0; messageIndex < 10; messageIndex += 1) {
      act(() => {
        result.current.recordMessage();
      });
    }

    expect(result.current.canSendMessage()).toBe(false);
  });

  it("resets automatically after the time window passes", () => {
    const { result } = renderHook(() => useRateLimit());

    for (let messageIndex = 0; messageIndex < 10; messageIndex += 1) {
      act(() => {
        result.current.recordMessage();
      });
    }

    expect(result.current.canSendMessage()).toBe(false);

    act(() => {
      vi.advanceTimersByTime(10001);
    });

    expect(result.current.canSendMessage()).toBe(true);
  });

  it("auto-cleans timestamps that fall outside a custom window", () => {
    const { result } = renderHook(() => useRateLimit(2, 1000));

    act(() => {
      result.current.recordMessage();
    });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    act(() => {
      result.current.recordMessage();
    });

    expect(result.current.canSendMessage()).toBe(false);

    act(() => {
      vi.advanceTimersByTime(401);
    });

    expect(result.current.canSendMessage()).toBe(true);
  });
});
