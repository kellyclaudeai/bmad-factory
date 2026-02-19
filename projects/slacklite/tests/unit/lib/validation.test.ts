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
    it("removes script tags and html tags", () => {
      expect(
        sanitizeMessageText(
          'Hello <script>alert("xss")</script><b>team</b>!',
        ),
      ).toBe("Hello team!");
    });

    it("removes javascript: protocol fragments", () => {
      expect(sanitizeMessageText("javascript:alert(1) safe text")).toBe(
        "alert(1) safe text",
      );
    });

    it("removes encoded script tags and decodes safe entities", () => {
      expect(
        sanitizeMessageText("Fish &amp; Chips &lt;script&gt;alert(1)&lt;/script&gt;"),
      ).toBe("Fish & Chips");
    });
  });

  describe("hasBlockedXssPattern", () => {
    it("detects blocked XSS patterns", () => {
      expect(hasBlockedXssPattern('<img src=x onerror="alert(1)" />')).toBe(
        true,
      );
      expect(hasBlockedXssPattern("javascript:alert(1)")).toBe(true);
      expect(hasBlockedXssPattern("<script>alert(1)</script>")).toBe(true);
      expect(hasBlockedXssPattern("&lt;script&gt;alert(1)&lt;/script&gt;")).toBe(
        true,
      );
      expect(hasBlockedXssPattern("javascript&#58;alert(1)")).toBe(true);
    });

    it("allows safe text", () => {
      expect(hasBlockedXssPattern("hello team")).toBe(false);
    });
  });

  describe("validateMessageText", () => {
    it("rejects empty messages", () => {
      expect(validateMessageText("   ")).toEqual({
        valid: false,
        error: "Message cannot be empty.",
      });
    });

    it("rejects blocked xss patterns", () => {
      expect(validateMessageText("javascript:alert(1)")).toEqual({
        valid: false,
        error: "Message contains blocked content.",
      });
    });

    it("rejects messages above max length", () => {
      const tooLong = "a".repeat(11);
      expect(validateMessageText(tooLong, 10)).toEqual({
        valid: false,
        error: "Message must be 10 characters or fewer.",
      });
    });

    it("accepts a valid message after sanitization", () => {
      expect(validateMessageText("<b>hello</b> world")).toEqual({
        valid: true,
      });
    });
  });

  describe("validateChannelName", () => {
    it("accepts lowercase channel names with hyphens", () => {
      expect(validateChannelName("engineering-team")).toEqual({ valid: true });
    });

    it("rejects names with uppercase or spaces", () => {
      expect(validateChannelName("Engineering Team")).toEqual({
        valid: false,
        error: "Use only lowercase letters, numbers, and hyphens.",
      });
    });

    it("rejects names outside the 1-50 character range", () => {
      expect(validateChannelName("")).toEqual({
        valid: false,
        error: "Channel name must be 1-50 characters.",
      });
      expect(validateChannelName("a".repeat(51))).toEqual({
        valid: false,
        error: "Channel name must be 1-50 characters.",
      });
    });
  });

  describe("validateWorkspaceName", () => {
    it("accepts alphanumeric names with spaces", () => {
      expect(validateWorkspaceName("Acme Team 42")).toEqual({ valid: true });
    });

    it("rejects invalid symbols", () => {
      expect(validateWorkspaceName("Acme@Team")).toEqual({
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

    it("rejects malformed emails", () => {
      expect(validateEmail("not-an-email")).toEqual({
        valid: false,
        error: "Enter a valid email address.",
      });
    });

    it("accepts valid email addresses", () => {
      expect(validateEmail("dev@example.com")).toEqual({ valid: true });
    });
  });
});
