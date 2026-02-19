import MessageItem from "./MessageItem";

import type { Message } from "@/lib/types/models";

export interface MessageListProps {
  messages: Message[];
  loading: boolean;
  error: Error | null;
}

function Spinner() {
  return (
    <div role="status" className="flex items-center gap-2 text-sm text-gray-600">
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
      />
      Loading messages...
    </div>
  );
}

export default function MessageList({ messages, loading, error }: MessageListProps) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-error">Failed to load messages</div>;
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-500">
        <p>No messages yet</p>
        <p className="text-sm">Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 overflow-y-auto p-4">
      {messages.map((message) => (
        <MessageItem key={message.messageId} message={message} />
      ))}
    </div>
  );
}
