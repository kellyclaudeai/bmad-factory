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

  it("formats same-day timestamps using relative time", () => {
    const twoMinutesAgo = Timestamp.fromDate(new Date(2026, 1, 19, 11, 58, 0));

    expect(formatRelativeTime(twoMinutesAgo)).toMatch(/2 minutes? ago/);
  });

  it("formats yesterday timestamps with time of day", () => {
    const yesterday = Timestamp.fromDate(new Date(2026, 1, 18, 9, 30, 0));

    expect(formatRelativeTime(yesterday)).toMatch(
      /^Yesterday at \d{1,2}:\d{2} [AP]M$/i,
    );
  });

  it("formats older same-year timestamps as month and day", () => {
    const earlierThisYear = Timestamp.fromDate(new Date(2026, 0, 5, 12, 0, 0));

    expect(formatRelativeTime(earlierThisYear)).toBe("Jan 5");
  });

  it("formats previous-year timestamps with year included", () => {
    const lastYear = Timestamp.fromDate(new Date(2025, 11, 31, 12, 0, 0));

    expect(formatRelativeTime(lastYear)).toBe("Dec 31, 2025");
  });
});
