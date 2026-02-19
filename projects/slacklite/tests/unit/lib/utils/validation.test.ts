import { describe, expect, it } from "vitest";

import {
  hasBlockedXssPattern,
  sanitizeMessageText,
  validateChannelName,
  validateEmail,
  validateMessageText,
  validateWorkspaceName,
} from "@/lib/utils/validation";

describe("validation utilities", () => {
  describe("sanitizeMessageText", () => {
    it("removes script tags, javascript protocol usage, and html tags", () => {
      const text =
        '  <script>alert("xss")</script><b>Hello</b> javascript:alert(1) world  ';

      expect(sanitizeMessageText(text)).toBe("Hello alert(1) world");
    });

    it("removes encoded script tags and decodes safe HTML entities", () => {
      const text = "Fish &amp; Chips &lt;script&gt;alert(1)&lt;/script&gt;";

      expect(sanitizeMessageText(text)).toBe("Fish & Chips");
    });
  });

  describe("hasBlockedXssPattern", () => {
    it("detects blocked xss patterns", () => {
      expect(hasBlockedXssPattern('<img src=x onerror="alert(1)">')).toBe(true);
      expect(hasBlockedXssPattern("javascript:alert(1)")).toBe(true);
      expect(hasBlockedXssPattern("<script>alert(1)</script>")).toBe(true);
      expect(hasBlockedXssPattern("&lt;script&gt;alert(1)&lt;/script&gt;")).toBe(true);
      expect(hasBlockedXssPattern("javascript&#58;alert(1)")).toBe(true);
    });

    it("returns false for safe text", () => {
      expect(hasBlockedXssPattern("hello team, ship it")).toBe(false);
    });
  });

  describe("validateMessageText", () => {
    it("rejects empty messages after sanitization", () => {
      expect(validateMessageText("   <b>   </b>   ")).toEqual({
        valid: false,
        error: "Message cannot be empty.",
      });
    });

    it("rejects messages over the max length", () => {
      expect(validateMessageText("a".repeat(11), 10)).toEqual({
        valid: false,
        error: "Message must be 10 characters or fewer.",
      });
    });

    it("accepts valid message text", () => {
      expect(validateMessageText("hello world")).toEqual({
        valid: true,
      });
    });
  });

  describe("validateChannelName", () => {
    it("accepts trimmed lowercase channel names with hyphens", () => {
      expect(validateChannelName("  product-updates  ")).toEqual({ valid: true });
    });

    it("rejects invalid channel names", () => {
      expect(validateChannelName("")).toEqual({
        valid: false,
        error: "Channel name must be 1-50 characters.",
      });
      expect(validateChannelName("A-Channel")).toEqual({
        valid: false,
        error: "Use only lowercase letters, numbers, and hyphens.",
      });
      expect(validateChannelName("a".repeat(51))).toEqual({
        valid: false,
        error: "Channel name must be 1-50 characters.",
      });
    });
  });

  describe("validateWorkspaceName", () => {
    it("accepts workspace names with letters, numbers, and spaces", () => {
      expect(validateWorkspaceName("  Team 42  ")).toEqual({ valid: true });
    });

    it("rejects workspace names with unsupported characters", () => {
      expect(validateWorkspaceName("")).toEqual({
        valid: false,
        error: "Workspace name must be 1-50 characters.",
      });
      expect(validateWorkspaceName("team-workspace")).toEqual({
        valid: false,
        error: "Use only letters, numbers, and spaces.",
      });
    });
  });

  describe("validateEmail", () => {
    it("requires a non-empty email", () => {
      expect(validateEmail("   ")).toEqual({
        valid: false,
        error: "Email is required.",
      });
    });

    it("rejects invalid email formats", () => {
      expect(validateEmail("not-an-email")).toEqual({
        valid: false,
        error: "Enter a valid email address.",
      });
    });

    it("accepts valid trimmed email addresses", () => {
      expect(validateEmail("  user@example.com  ")).toEqual({ valid: true });
    });
  });
});
