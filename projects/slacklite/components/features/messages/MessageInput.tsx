"use client";

import {
  type ChangeEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/Button";
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
    void Promise.resolve(onSend(sanitizedText)).catch(() => undefined);
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

  return (
    <div className="border-t-2 border-gray-300 p-4" data-channel-id={channelId}>
      <div className="flex items-end gap-3">
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
          className={`${isMobile ? "min-h-[60px]" : "min-h-[44px]"} max-h-[200px] flex-1 resize-none overflow-y-auto rounded-lg border-2 border-gray-500 p-3 text-base text-gray-900 focus:border-primary-brand focus:outline-none focus:ring-2 focus:ring-primary-brand focus:ring-offset-1`}
          style={{ height: `${getMinTextareaHeight(isMobile)}px` }}
          rows={1}
        />
        <Button
          variant="primary"
          onClick={handleSend}
          disabled={isSendDisabled}
          className={isMobile ? "h-11 w-11 flex-shrink-0 p-0" : ""}
          aria-label={isMobile ? "Send message" : undefined}
        >
          {isMobile ? "→" : "Send"}
        </Button>
      </div>

      {showCounter && (
        <p className={`mt-2 text-sm ${isOverLimit ? "text-error" : "text-gray-700"}`}>
          {text.length} / {MAX_MESSAGE_LENGTH}
        </p>
      )}

      {isOverLimit && (
        <p className="mt-1 text-sm text-error" role="alert">
          {MESSAGE_TOO_LONG_ERROR}
        </p>
      )}

      {rateLimitError && (
        <p className="mt-1 text-sm text-error" role="alert">
          {rateLimitError}
        </p>
      )}
    </div>
  );
}

export default MessageInput;
