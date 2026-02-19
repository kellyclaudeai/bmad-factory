/**
 * Story 10.7: Performance Testing & Benchmarking
 *
 * Threshold tests — regular Vitest tests that assert operations complete
 * within the time budgets defined in the PRD / architecture:
 *
 *   - Message validation:   <5ms  per call
 *   - Channel validation:   <1ms  per call
 *   - Timestamp formatting: <1ms  per call
 *   - 1 000-call batch:     <100ms total
 *   - trackMessageLatency:  <1ms  arithmetic overhead
 *   - trackChannelSwitch:   <1ms  arithmetic overhead
 *
 * These tests run in the normal `pnpm test` / `vitest` suite.
 */

import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import { formatRelativeTime } from "@/lib/utils/formatting";
import {
  sanitizeMessageText,
  validateChannelName,
  validateEmail,
  validateMessageText,
  validateWorkspaceName,
} from "@/lib/utils/validation";
import {
  trackAuthTime,
  trackChannelSwitch,
  trackMessageLatency,
} from "@/lib/monitoring/performance";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTimestamp(offsetMs: number): Timestamp {
  return Timestamp.fromDate(new Date(Date.now() - offsetMs));
}

/** Measure wall-clock time for a synchronous function, returns ms elapsed. */
function measureMs(fn: () => void, iterations = 1): number {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  return performance.now() - start;
}

// ---------------------------------------------------------------------------
// formatRelativeTime threshold tests
// ---------------------------------------------------------------------------

describe("formatRelativeTime — performance thresholds", () => {
  it("formats a recent timestamp (<1 hour) in <1ms", () => {
    const ts = makeTimestamp(5 * 60 * 1000);
    const elapsed = measureMs(() => formatRelativeTime(ts));
    expect(elapsed).toBeLessThan(1);
  });

  it("formats a 'today' timestamp in <1ms", () => {
    const ts = makeTimestamp(3 * 60 * 60 * 1000);
    const elapsed = measureMs(() => formatRelativeTime(ts));
    expect(elapsed).toBeLessThan(1);
  });

  it("formats a 'yesterday' timestamp in <1ms", () => {
    const ts = makeTimestamp(27 * 60 * 60 * 1000);
    const elapsed = measureMs(() => formatRelativeTime(ts));
    expect(elapsed).toBeLessThan(1);
  });

  it("formats 1 000 timestamps in <50ms", () => {
    const ts = makeTimestamp(5 * 60 * 1000);
    const elapsed = measureMs(() => formatRelativeTime(ts), 1000);
    expect(elapsed).toBeLessThan(50);
  });
});

// ---------------------------------------------------------------------------
// validateChannelName threshold tests
// ---------------------------------------------------------------------------

describe("validateChannelName — performance thresholds", () => {
  it("validates a valid channel name in <1ms", () => {
    const elapsed = measureMs(() => validateChannelName("general"));
    expect(elapsed).toBeLessThan(1);
  });

  it("validates an invalid channel name in <1ms", () => {
    const elapsed = measureMs(() => validateChannelName("Invalid Name!"));
    expect(elapsed).toBeLessThan(1);
  });

  it("validates 1 000 channel names in <50ms", () => {
    const elapsed = measureMs(() => validateChannelName("team-updates"), 1000);
    expect(elapsed).toBeLessThan(50);
  });
});

// ---------------------------------------------------------------------------
// validateEmail threshold tests
// ---------------------------------------------------------------------------

describe("validateEmail — performance thresholds", () => {
  it("validates a valid email in <1ms", () => {
    const elapsed = measureMs(() => validateEmail("user@example.com"));
    expect(elapsed).toBeLessThan(1);
  });

  it("validates an invalid email in <1ms", () => {
    const elapsed = measureMs(() => validateEmail("notanemail"));
    expect(elapsed).toBeLessThan(1);
  });

  it("validates 1 000 emails in <50ms", () => {
    const elapsed = measureMs(
      () => validateEmail("first.last@subdomain.example.com"),
      1000,
    );
    expect(elapsed).toBeLessThan(50);
  });
});

// ---------------------------------------------------------------------------
// validateWorkspaceName threshold tests
// ---------------------------------------------------------------------------

describe("validateWorkspaceName — performance thresholds", () => {
  it("validates a valid workspace name in <1ms", () => {
    const elapsed = measureMs(() => validateWorkspaceName("Acme Corp"));
    expect(elapsed).toBeLessThan(1);
  });

  it("validates 1 000 workspace names in <50ms", () => {
    const elapsed = measureMs(() => validateWorkspaceName("Dev Team"), 1000);
    expect(elapsed).toBeLessThan(50);
  });
});

// ---------------------------------------------------------------------------
// validateMessageText threshold tests
// ---------------------------------------------------------------------------

describe("validateMessageText — performance thresholds", () => {
  const shortMsg = "Hello world";
  const mediumMsg = "This is a medium-length message. ".repeat(6); // ~198 chars
  const longMsg = "A".repeat(3999);
  const xssMsg = "<script>alert('xss')</script>";

  it("validates a short message in <5ms", () => {
    const elapsed = measureMs(() => validateMessageText(shortMsg));
    expect(elapsed).toBeLessThan(5);
  });

  it("validates a medium-length message in <5ms", () => {
    const elapsed = measureMs(() => validateMessageText(mediumMsg));
    expect(elapsed).toBeLessThan(5);
  });

  it("validates a near-max message (3999 chars) in <5ms", () => {
    const elapsed = measureMs(() => validateMessageText(longMsg));
    expect(elapsed).toBeLessThan(5);
  });

  it("rejects an XSS attempt in <5ms", () => {
    const elapsed = measureMs(() => validateMessageText(xssMsg));
    expect(elapsed).toBeLessThan(5);
  });

  it("validates 1 000 short messages in <100ms", () => {
    const elapsed = measureMs(() => validateMessageText(shortMsg), 1000);
    expect(elapsed).toBeLessThan(100);
  });

  it("validates 100 near-max messages in <100ms", () => {
    const elapsed = measureMs(() => validateMessageText(longMsg), 100);
    expect(elapsed).toBeLessThan(100);
  });
});

// ---------------------------------------------------------------------------
// sanitizeMessageText threshold tests
// ---------------------------------------------------------------------------

describe("sanitizeMessageText — performance thresholds", () => {
  it("sanitizes plain text in <2ms", () => {
    const elapsed = measureMs(() =>
      sanitizeMessageText("Hello, this is a safe message!"),
    );
    expect(elapsed).toBeLessThan(2);
  });

  it("sanitizes HTML-containing text in <15ms", () => {
    // DOMPurify parses real DOM nodes; first call initializes the instance.
    // Allow up to 15ms to account for DOMPurify lazy-init overhead in jsdom.
    const elapsed = measureMs(() =>
      sanitizeMessageText("<b>Hello</b> <script>evil()</script>"),
    );
    expect(elapsed).toBeLessThan(15);
  });

  it("sanitizes 1 000 messages in <100ms", () => {
    const elapsed = measureMs(
      () => sanitizeMessageText("Normal safe message text here."),
      1000,
    );
    expect(elapsed).toBeLessThan(100);
  });
});

// ---------------------------------------------------------------------------
// Performance monitoring arithmetic overhead tests
// ---------------------------------------------------------------------------

describe("performance monitoring — arithmetic overhead", () => {
  const now = Date.now();

  it("trackMessageLatency arithmetic completes in <1ms", () => {
    const elapsed = measureMs(() => trackMessageLatency(now, now + 250));
    expect(elapsed).toBeLessThan(1);
  });

  it("trackChannelSwitch arithmetic completes in <1ms", () => {
    const elapsed = measureMs(() => trackChannelSwitch(now, now + 150));
    expect(elapsed).toBeLessThan(1);
  });

  it("trackAuthTime arithmetic completes in <1ms", () => {
    const elapsed = measureMs(() => trackAuthTime(now, now + 500));
    expect(elapsed).toBeLessThan(1);
  });

  it("trackMessageLatency handles 1 000 calls in <50ms", () => {
    const elapsed = measureMs(() => trackMessageLatency(now, now + 250), 1000);
    expect(elapsed).toBeLessThan(50);
  });

  it("trackChannelSwitch returns correct duration", () => {
    const start = 1000;
    const end = 1150;
    const result = trackChannelSwitch(start, end);
    expect(result).toBe(150);
  });

  it("trackMessageLatency returns correct latency", () => {
    const result = trackMessageLatency(1000, 1300);
    expect(result).toBe(300);
  });

  it("trackAuthTime returns correct duration", () => {
    const result = trackAuthTime(1000, 1800);
    expect(result).toBe(800);
  });

  it("trackMessageLatency skips very old messages (> 60s) without error", () => {
    const oldSendTime = now - 120_000; // 2 minutes ago
    const result = trackMessageLatency(oldSendTime, now);
    // Should return latency but skip analytics (>60s)
    expect(result).toBeGreaterThan(60_000);
  });
});
