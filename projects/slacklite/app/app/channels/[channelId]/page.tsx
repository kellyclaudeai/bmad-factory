"use client";

import { useEffect, useState } from "react";
import { MessageInput } from "@/components/features/messages/MessageInput";
import { useRealtimeMessages } from "@/lib/hooks/useRealtimeMessages";
import { useAuth } from "@/lib/contexts/AuthContext";

interface ChannelPageProps {
  params: { channelId: string };
}

export default function ChannelPage({ params }: ChannelPageProps) {
  const { channelId } = params;
  const { user } = useAuth();
  const { messages, loading, error } = useRealtimeMessages(channelId);
  const [isChannelSwitching, setIsChannelSwitching] = useState(false);

  // Track channel switches for loading indicator
  useEffect(() => {
    setIsChannelSwitching(true);
    const timer = setTimeout(() => {
      setIsChannelSwitching(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [channelId]);

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-600">Please sign in to view messages.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4">
        {(loading || isChannelSwitching) && (
          <div className="flex items-center justify-center py-8">
            <div role="status" className="flex items-center gap-2 text-sm text-gray-600">
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
              />
              Loading messages...
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Failed to load messages. Please try again.
            </p>
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900">No messages yet</p>
              <p className="mt-1 text-sm text-gray-600">
                Be the first to send a message in this channel!
              </p>
            </div>
          </div>
        )}

        {!loading && !error && messages.length > 0 && (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.messageId} className="flex gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-primary-brand text-white font-semibold">
                  {message.userName?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-gray-900">
                      {message.userName || "Unknown"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp
                        ? new Date(
                            typeof message.timestamp === "number"
                              ? message.timestamp
                              : message.timestamp.toMillis()
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap break-words">
                    {message.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Input */}
      <MessageInput channelId={channelId} />
    </div>
  );
}
