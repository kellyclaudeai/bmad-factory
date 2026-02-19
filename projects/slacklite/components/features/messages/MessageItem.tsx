"use client";

import { useEffect, useState } from "react";

import { formatRelativeTime } from "@/lib/utils/formatting";
import type { Message } from "@/lib/types/models";

export interface MessageItemProps {
  message: Message;
}

const TRUNCATED_MESSAGE_LENGTH = 2000;

export default function MessageItem({ message }: MessageItemProps) {
  const [, setTick] = useState(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTick((tick) => tick + 1);
    }, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const formattedTimestamp = formatRelativeTime(message.timestamp);
  const isTruncated = message.text.length > TRUNCATED_MESSAGE_LENGTH;
  const displayText =
    isTruncated && !isExpanded
      ? message.text.slice(0, TRUNCATED_MESSAGE_LENGTH)
      : message.text;

  return (
    <article
      className="border-b border-gray-300 px-4 py-3 transition-colors hover:bg-gray-200"
      aria-label={`Message from ${message.userName} at ${formattedTimestamp}`}
    >
      <div className="flex items-baseline">
        <span className="text-sm font-semibold text-gray-900">{message.userName}</span>
        <span className="ml-2 text-[13px] text-gray-700">{formattedTimestamp}</span>
      </div>
      <p className="mt-1 break-words whitespace-pre-wrap text-base text-gray-900">
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
    </article>
  );
}
