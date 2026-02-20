"use client";

import {
  type ChangeEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRateLimit } from "@/lib/hooks/useRateLimit";
import { sanitizeMessageText, validateMessageText } from "@/lib/utils/validation";

const MOBILE_BREAKPOINT = 768;
const DESKTOP_MIN_TEXTAREA_HEIGHT = 44;
const MOBILE_MIN_TEXTAREA_HEIGHT = 60;
const MAX_TEXTAREA_HEIGHT = 200;
const MOBILE_FOCUSED_TEXTAREA_HEIGHT = "60vh";
const MAX_MESSAGE_LENGTH = 4000;
const COUNTER_THRESHOLD = 3900;
const MESSAGE_TOO_LONG_ERROR = "Message too long. Maximum 4,000 characters.";
const RATE_LIMIT_ERROR_MESSAGE = "Slow down! Max 10 messages per 10 seconds.";
const RATE_LIMIT_ERROR_TIMEOUT_MS = 3000;

export interface MessageInputProps {
  channelId: string;
  onSend: (text: string) => void | Promise<unknown>;
}

function getMinTextareaHeight(isMobile: boolean): number {
  return isMobile ? MOBILE_MIN_TEXTAREA_HEIGHT : DESKTOP_MIN_TEXTAREA_HEIGHT;
}

function resizeTextarea(
  textarea: HTMLTextAreaElement,
  {
    isMobile,
    isFocused,
  }: {
    isMobile: boolean;
    isFocused: boolean;
  },
): void {
  if (isMobile && isFocused) {
    textarea.style.height = MOBILE_FOCUSED_TEXTAREA_HEIGHT;
    return;
  }

  const minHeight = getMinTextareaHeight(isMobile);
  textarea.style.height = "auto";
  const nextHeight = Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT);
  textarea.style.height = `${Math.max(nextHeight, minHeight)}px`;
}

function resetTextareaHeight(textarea: HTMLTextAreaElement, isMobile: boolean): void {
  textarea.style.height = `${getMinTextareaHeight(isMobile)}px`;
}

export function MessageInput({ channelId, onSend }: MessageInputProps) {
  const [text, setText] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [rateLimitError, setRateLimitError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rateLimitErrorTimeoutRef = useRef<number | null>(null);
  const { canSendMessage, recordMessage } = useRateLimit();

  const trimmedText = text.trim();
  const isOverLimit = text.length > MAX_MESSAGE_LENGTH;
  const isAtLimit = text.length >= MAX_MESSAGE_LENGTH;
  const showCounter = text.length > COUNTER_THRESHOLD;
  const isRateLimited = !canSendMessage();
  const isSendDisabled = trimmedText.length === 0 || isOverLimit || isRateLimited;

  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      resizeTextarea(textareaRef.current, { isMobile, isFocused });
    }
  }, [isFocused, isMobile]);

  useEffect(() => {
    setText("");
    setIsFocused(false);
    setRateLimitError("");
    if (rateLimitErrorTimeoutRef.current !== null) {
      window.clearTimeout(rateLimitErrorTimeoutRef.current);
      rateLimitErrorTimeoutRef.current = null;
    }
    if (textareaRef.current) {
      resetTextareaHeight(textareaRef.current, window.innerWidth < MOBILE_BREAKPOINT);
    }
  }, [channelId]);

  useEffect(
    () => () => {
      if (rateLimitErrorTimeoutRef.current !== null) {
        window.clearTimeout(rateLimitErrorTimeoutRef.current);
      }
    },
    [],
  );

  const showRateLimitError = useCallback(() => {
    setRateLimitError(RATE_LIMIT_ERROR_MESSAGE);
    if (rateLimitErrorTimeoutRef.current !== null) {
      window.clearTimeout(rateLimitErrorTimeoutRef.current);
    }

    rateLimitErrorTimeoutRef.current = window.setTimeout(() => {
      setRateLimitError("");
      rateLimitErrorTimeoutRef.current = null;
    }, RATE_LIMIT_ERROR_TIMEOUT_MS);
  }, []);

  const handleSend = useCallback(() => {
    if (isRateLimited) {
      showRateLimitError();
      return;
    }

    if (trimmedText.length === 0 || isOverLimit) {
      return;
    }

    const validationResult = validateMessageText(text, MAX_MESSAGE_LENGTH);

    if (!validationResult.valid) {
      return;
    }

    const sanitizedText = sanitizeMessageText(text);

    if (sanitizedText.length === 0 || sanitizedText.length > MAX_MESSAGE_LENGTH) {
      return;
    }

    recordMessage();
    // DIAGNOSTIC: log channelId and sanitized text length before calling onSend
    console.log('[DIAG][MessageInput] onSend called — channelId:', channelId, 'textLength:', sanitizedText.length);
    void Promise.resolve(onSend(sanitizedText))
      .then((result) => {
        console.log('[DIAG][MessageInput] onSend SUCCESS — channelId:', channelId, 'result:', result);
      })
      .catch((sendError: unknown) => {
        // DIAGNOSTIC: surface errors that were previously silently swallowed
        console.error('[DIAG][MessageInput] onSend FAILED — channelId:', channelId, 'error:', sendError);
      });
    setText("");

    if (textareaRef.current) {
      if (isMobile) {
        resizeTextarea(textareaRef.current, { isFocused, isMobile: true });
      } else {
        resetTextareaHeight(textareaRef.current, false);
        textareaRef.current.focus();
      }
    }
  }, [
    isFocused,
    isMobile,
    isOverLimit,
    isRateLimited,
    onSend,
    recordMessage,
    showRateLimitError,
    text,
    trimmedText,
  ]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value);
      resizeTextarea(event.target, { isFocused, isMobile });
    },
    [isFocused, isMobile],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== "Enter" || event.nativeEvent.isComposing) {
        return;
      }

      if (isMobile || !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend, isMobile],
  );

  // Build container border/ring classes based on state
  const containerBorderClasses = isAtLimit
    ? "border-error ring-1 ring-error"
    : isFocused
      ? "border-accent ring-1 ring-accent"
      : "border-border";

  return (
    <div className="px-4 py-3 bg-surface-2 flex-shrink-0" data-channel-id={channelId}>
      {/* Input container */}
      <div
        className={`flex items-end gap-2 bg-surface-3 border rounded-md px-3 py-2 transition-all ${containerBorderClasses}`}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={(event) => {
            setIsFocused(true);
            resizeTextarea(event.currentTarget, { isFocused: true, isMobile });
          }}
          onBlur={(event) => {
            setIsFocused(false);
            resizeTextarea(event.currentTarget, { isFocused: false, isMobile });
          }}
          placeholder="Type a message..."
          maxLength={MAX_MESSAGE_LENGTH}
          className="flex-1 bg-transparent text-primary placeholder:text-muted text-sm font-sans resize-none outline-none leading-relaxed overflow-hidden"
          style={{ height: `${getMinTextareaHeight(isMobile)}px` }}
          rows={1}
        />

        {/* Character counter — only shown at COUNTER_THRESHOLD+ */}
        {showCounter && (
          <span
            className={`text-xs font-mono flex-shrink-0 self-end pb-0.5 ${isAtLimit ? "text-error" : "text-muted"}`}
          >
            {MAX_MESSAGE_LENGTH - text.length}
          </span>
        )}

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={isSendDisabled}
          aria-label={isMobile ? "Send message" : undefined}
          className={`flex-shrink-0 self-end px-3 py-1.5 rounded text-sm font-semibold transition-colors bg-accent hover:bg-accent-hover text-inverse disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-accent${isMobile ? " h-9 w-9 p-0" : ""}`}
        >
          {isMobile ? "→" : "Send"}
        </button>
      </div>

      {/* Helper text */}
      <p className="text-muted text-xs font-mono mt-1.5 px-0.5">
        Enter to send · Shift+Enter for newline
      </p>

      {/* Over-limit error */}
      {isOverLimit && (
        <p className="text-error text-xs font-mono mt-1 px-0.5" role="alert">
          {MESSAGE_TOO_LONG_ERROR}
        </p>
      )}

      {/* Rate limit / send failure */}
      {rateLimitError && (
        <div
          className="mt-2 bg-error-subtle border border-error text-error text-sm rounded-md px-3 py-2 font-mono"
          role="alert"
        >
          {rateLimitError}
        </div>
      )}
    </div>
  );
}

export default MessageInput;
