import createDOMPurify from "dompurify";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const CHANNEL_NAME_PATTERN = /^[a-z0-9-]+$/;
const WORKSPACE_NAME_PATTERN = /^[A-Za-z0-9 ]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SCRIPT_TAG_PATTERN =
  /<\s*script\b[^>]*>([\s\S]*?)<\s*\/\s*script\s*>/gi;
const JAVASCRIPT_PROTOCOL_PATTERN = /javascript\s*:/gi;
const HTML_TAG_PATTERN = /<[^>]*>/g;
const XSS_PATTERN = /<\s*script|javascript\s*:|on\w+\s*=/i;
const MESSAGE_MAX_LENGTH = 4000;
const BLOCKED_XSS_ERROR = "Message contains blocked content.";

let domPurifyInstance: ReturnType<typeof createDOMPurify> | null = null;

function getDOMPurifyInstance(): ReturnType<typeof createDOMPurify> | null {
  if (domPurifyInstance) {
    return domPurifyInstance;
  }

  if (typeof window === "undefined") {
    return null;
  }

  domPurifyInstance = createDOMPurify(window);
  return domPurifyInstance;
}

function fail(error: string): ValidationResult {
  return {
    valid: false,
    error,
  };
}

function success(): ValidationResult {
  return {
    valid: true,
  };
}

export function sanitizeMessageText(text: string): string {
  const withoutScriptTags = text.replace(SCRIPT_TAG_PATTERN, "");
  const purifier = getDOMPurifyInstance();
  const sanitized = purifier
    ? purifier.sanitize(withoutScriptTags, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
      })
    : withoutScriptTags.replace(HTML_TAG_PATTERN, "");

  return sanitized
    .replace(JAVASCRIPT_PROTOCOL_PATTERN, "")
    .trim();
}

export function hasBlockedXssPattern(text: string): boolean {
  return XSS_PATTERN.test(text);
}

export function validateMessageText(
  text: string,
  maxLength = MESSAGE_MAX_LENGTH,
): ValidationResult {
  if (hasBlockedXssPattern(text)) {
    return fail(BLOCKED_XSS_ERROR);
  }

  const sanitized = sanitizeMessageText(text);

  if (sanitized.length === 0) {
    return fail("Message cannot be empty.");
  }

  if (sanitized.length > maxLength) {
    return fail(`Message must be ${maxLength} characters or fewer.`);
  }

  return success();
}

export function validateChannelName(name: string): ValidationResult {
  const normalized = name.trim();

  if (normalized.length < 1 || normalized.length > 50) {
    return fail("Channel name must be 1-50 characters.");
  }

  if (!CHANNEL_NAME_PATTERN.test(normalized)) {
    return fail("Use only lowercase letters, numbers, and hyphens.");
  }

  return success();
}

export function validateWorkspaceName(name: string): ValidationResult {
  const normalized = name.trim();

  if (normalized.length < 1 || normalized.length > 50) {
    return fail("Workspace name must be 1-50 characters.");
  }

  if (!WORKSPACE_NAME_PATTERN.test(normalized)) {
    return fail("Use only letters, numbers, and spaces.");
  }

  return success();
}

export function validateEmail(email: string): ValidationResult {
  const normalized = email.trim();

  if (normalized.length === 0) {
    return fail("Email is required.");
  }

  if (!EMAIL_PATTERN.test(normalized)) {
    return fail("Enter a valid email address.");
  }

  return success();
}
