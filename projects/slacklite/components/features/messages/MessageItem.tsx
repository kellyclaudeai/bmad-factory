"use client";

import { useEffect, useState } from "react";

import { formatRelativeTime, formatTimeShort } from "@/lib/utils/formatting";
import type { Message } from "@/lib/types/models";

export interface MessageItemProps {
  message: Message;
  /** True when this message is the first in a consecutive author group. Defaults to true. */
  isGroupStart?: boolean;
  /** Callback invoked when the user clicks "Retry" on a failed message. */
  onRetry?: () => void;
}

const TRUNCATED_MESSAGE_LENGTH = 2000;

function MessageActions({ message }: { message: Message }) {
  return (
    <div className="absolute right-4 top-1 hidden group-hover:flex items-center gap-1">
      <button
        type="button"
        className="p-1 text-muted hover:text-primary hover:bg-surface-4 rounded transition-colors"
        title="React"
        aria-label={`React to message from ${message.userName}`}
      >
        <span className="text-xs" aria-hidden="true">😊</span>
      </button>
    </div>
  );
}

export default function MessageItem({ message, isGroupStart = true, onRetry }: MessageItemProps) {
  const [, setTick] = useState(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Re-render every minute so relative timestamps stay fresh.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTick((tick) => tick + 1);
    }, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const formattedTimestamp = formatRelativeTime(message.timestamp);
  const formattedTimeShort = formatTimeShort(message.timestamp);
  const isTruncated = message.text.length > TRUNCATED_MESSAGE_LENGTH;
  const displayText =
    isTruncated && !isExpanded
      ? message.text.slice(0, TRUNCATED_MESSAGE_LENGTH)
      : message.text;

  const messageBody = (
    <>
      <p className="text-primary text-sm leading-relaxed break-words whitespace-pre-wrap">
        {displayText}
        {isTruncated && (
          <>
            {!isExpanded && "... "}
            <button
              type="button"
              onClick={() => {
                setIsExpanded((expanded) => !expanded);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  setIsExpanded((expanded) => !expanded);
                }
              }}
              className="ml-1 text-primary-brand hover:underline"
              aria-expanded={isExpanded}
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          </>
        )}
      </p>
      {message.status === "failed" && (
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-error">Failed to send.</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs font-medium text-error underline decoration-error/60 underline-offset-2 hover:text-red-700"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </>
  );

  if (isGroupStart) {
    // ── Group leader: avatar + display name + full timestamp ───────────────
    return (
      <div
        className="group relative flex items-start gap-3 px-4 py-1.5 hover:bg-surface-3/40 rounded transition-colors"
        aria-label={`Message from ${message.userName} at ${formattedTimestamp}`}
      >
        {/* 32 px avatar circle */}
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center mt-0.5"
          aria-hidden="true"
        >
          <span className="text-secondary text-xs font-mono font-semibold uppercase">
            {message.userName?.charAt(0) ?? "?"}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name + timestamp header */}
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-primary text-sm font-semibold leading-none">
              {message.userName}
            </span>
            <span className="text-muted text-xs font-mono flex-shrink-0">
              {message.status === "sending" ? "Sending…" : formattedTimestamp}
            </span>
          </div>

          {messageBody}
        </div>

        {/* Hover actions */}
        <MessageActions message={message} />
      </div>
    );
  }

  // ── Continuation message: indented, no avatar/name ─────────────────────
  return (
    <div
      className="group relative flex items-start gap-3 px-4 py-0.5 hover:bg-surface-3/40 rounded transition-colors"
      aria-label={`Continued message from ${message.userName} at ${formattedTimeShort}`}
    >
      {/* 32 px column — shows short timestamp on hover */}
      <div
        className="flex-shrink-0 w-8 flex items-center justify-end"
        aria-hidden="true"
      >
        <span className="text-muted text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity leading-none">
          {formattedTimeShort}
        </span>
      </div>

      {/* Content — left-edge aligns with group-leader text */}
      <div className="flex-1 min-w-0">
        {messageBody}
      </div>

      {/* Hover actions */}
      <MessageActions message={message} />
    </div>
  );
}
