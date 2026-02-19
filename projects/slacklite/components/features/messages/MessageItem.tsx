import { formatRelativeTime } from "@/lib/utils/formatting";
import type { Message } from "@/lib/types/models";

export interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const formattedTimestamp = formatRelativeTime(message.timestamp);

  return (
    <article
      className="border-b border-gray-300 px-4 py-3 transition-colors hover:bg-gray-200"
      aria-label={`Message from ${message.userName} at ${formattedTimestamp}`}
    >
      <div className="flex items-baseline">
        <span className="text-sm font-semibold text-gray-900">{message.userName}</span>
        <span className="ml-2 text-[13px] text-gray-700">{formattedTimestamp}</span>
      </div>
      <p className="mt-1 break-words text-base text-gray-900">{message.text}</p>
    </article>
  );
}
