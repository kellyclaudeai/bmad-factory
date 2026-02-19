/**
 * Story 10.7: Performance Testing & Benchmarking
 *
 * Micro-benchmarks for core utility functions using Vitest bench API.
 * Run with: pnpm test:bench
 *
 * Measures ops/sec for each operation to detect performance regressions.
 */

import { bench, describe } from "vitest";
import { Timestamp } from "firebase/firestore";
import { formatRelativeTime } from "@/lib/utils/formatting";
import {
  sanitizeMessageText,
  validateChannelName,
  validateEmail,
  validateMessageText,
  validateWorkspaceName,
} from "@/lib/utils/validation";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTimestamp(offsetMs: number): Timestamp {
  const date = new Date(Date.now() - offsetMs);
  return Timestamp.fromDate(date);
}

// ---------------------------------------------------------------------------
// formatRelativeTime benchmarks
// ---------------------------------------------------------------------------

describe("formatRelativeTime", () => {
  bench("timestamp 5 minutes ago", () => {
    formatRelativeTime(makeTimestamp(5 * 60 * 1000));
  });

  bench("timestamp from today", () => {
    formatRelativeTime(makeTimestamp(2 * 60 * 60 * 1000));
  });

  bench("timestamp from yesterday", () => {
    formatRelativeTime(makeTimestamp(26 * 60 * 60 * 1000));
  });

  bench("timestamp from last week", () => {
    formatRelativeTime(makeTimestamp(4 * 24 * 60 * 60 * 1000));
  });

  bench("timestamp from last year", () => {
    formatRelativeTime(makeTimestamp(400 * 24 * 60 * 60 * 1000));
  });
});

// ---------------------------------------------------------------------------
// validateMessageText benchmarks
// ---------------------------------------------------------------------------

describe("validateMessageText", () => {
  const shortMessage = "Hello world";
  const mediumMessage = "A".repeat(200);
  const longMessage = "A".repeat(3999);
  const xssAttempt = "<script>alert('xss')</script> Hello";
  const encodedXss = "&#60;script&#62;alert(1)&#60;/script&#62;";

  bench("short message (11 chars)", () => {
    validateMessageText(shortMessage);
  });

  bench("medium message (200 chars)", () => {
    validateMessageText(mediumMessage);
  });

  bench("long message (3999 chars)", () => {
    validateMessageText(longMessage);
  });

  bench("XSS attempt - blocked pattern", () => {
    validateMessageText(xssAttempt);
  });

  bench("encoded XSS - decode + block", () => {
    validateMessageText(encodedXss);
  });
});

// ---------------------------------------------------------------------------
// sanitizeMessageText benchmarks
// ---------------------------------------------------------------------------

describe("sanitizeMessageText", () => {
  const plainText = "Hello, this is a normal message with no special chars.";
  const htmlText = "<b>Bold</b> and <em>italic</em> text here";
  const mixedText =
    'Hello <script>evil()</script> world & <a href="javascript:void(0)">click</a>';

  bench("plain text", () => {
    sanitizeMessageText(plainText);
  });

  bench("HTML with tags", () => {
    sanitizeMessageText(htmlText);
  });

  bench("mixed HTML + script + JS protocol", () => {
    sanitizeMessageText(mixedText);
  });
});

// ---------------------------------------------------------------------------
// validateChannelName benchmarks
// ---------------------------------------------------------------------------

describe("validateChannelName", () => {
  bench("valid short name", () => {
    validateChannelName("general");
  });

  bench("valid hyphenated name", () => {
    validateChannelName("team-updates-2024");
  });

  bench("valid max-length name (50 chars)", () => {
    validateChannelName("a".repeat(50));
  });

  bench("invalid - uppercase letters", () => {
    validateChannelName("Team-Updates");
  });

  bench("invalid - too long (51 chars)", () => {
    validateChannelName("a".repeat(51));
  });
});

// ---------------------------------------------------------------------------
// validateEmail benchmarks
// ---------------------------------------------------------------------------

describe("validateEmail", () => {
  bench("valid simple email", () => {
    validateEmail("user@example.com");
  });

  bench("valid complex email", () => {
    validateEmail("first.last+tag@subdomain.example.co.uk");
  });

  bench("invalid - no @", () => {
    validateEmail("notanemail");
  });

  bench("invalid - no domain", () => {
    validateEmail("user@");
  });
});

// ---------------------------------------------------------------------------
// validateWorkspaceName benchmarks
// ---------------------------------------------------------------------------

describe("validateWorkspaceName", () => {
  bench("valid workspace name", () => {
    validateWorkspaceName("Acme Inc");
  });

  bench("valid single word", () => {
    validateWorkspaceName("DevTeam");
  });

  bench("valid max length (50 chars)", () => {
    validateWorkspaceName("A".repeat(50));
  });

  bench("invalid - special chars", () => {
    validateWorkspaceName("Acme-Inc!");
  });
});
