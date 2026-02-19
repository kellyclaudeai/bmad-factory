import { Timestamp } from "firebase/firestore";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatRelativeTime } from "@/lib/utils/formatting";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 19, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats timestamps from today using relative phrasing", () => {
    const twoMinutesAgo = Timestamp.fromMillis(Date.now() - 2 * 60 * 1000);

    expect(formatRelativeTime(twoMinutesAgo)).toMatch(/\d+\s+minutes?\s+ago/);
  });

  it("formats yesterday timestamps as 'Yesterday at h:mm a'", () => {
    const yesterday = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);

    expect(formatRelativeTime(yesterday)).toMatch(/^Yesterday at \d{1,2}:\d{2} [AP]M$/);
  });

  it("formats dates earlier this year as month/day", () => {
    const fiveDaysAgo = Timestamp.fromMillis(Date.now() - 5 * 24 * 60 * 60 * 1000);

    expect(formatRelativeTime(fiveDaysAgo)).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });

  it("formats dates from previous years with year included", () => {
    const previousYear = Timestamp.fromDate(new Date(2025, 11, 31, 12, 0, 0));

    expect(formatRelativeTime(previousYear)).toMatch(/^[A-Z][a-z]{2} \d{1,2}, 2025$/);
  });
});
