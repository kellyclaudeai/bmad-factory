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

const MIN_TEXTAREA_HEIGHT = 44;
const MAX_TEXTAREA_HEIGHT = 200;
const MAX_MESSAGE_LENGTH = 4000;
const COUNTER_THRESHOLD = 3900;

export interface MessageInputProps {
  channelId: string;
  onSend: (text: string) => void | Promise<void>;
}

function resizeTextarea(textarea: HTMLTextAreaElement): void {
  textarea.style.height = "auto";
  const nextHeight = Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT);
  textarea.style.height = `${Math.max(nextHeight, MIN_TEXTAREA_HEIGHT)}px`;
}

function resetTextareaHeight(textarea: HTMLTextAreaElement): void {
  textarea.style.height = `${MIN_TEXTAREA_HEIGHT}px`;
}

export function MessageInput({ channelId, onSend }: MessageInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmedText = text.trim();
  const isOverLimit = text.length > MAX_MESSAGE_LENGTH;
  const showCounter = text.length > COUNTER_THRESHOLD;
  const isSendDisabled = trimmedText.length === 0 || isOverLimit;

  useEffect(() => {
    setText("");
    if (textareaRef.current) {
      resetTextareaHeight(textareaRef.current);
    }
  }, [channelId]);

  const handleSend = useCallback(() => {
    if (isSendDisabled) {
      return;
    }

    void onSend(text);
    setText("");

    if (textareaRef.current) {
      resetTextareaHeight(textareaRef.current);
      textareaRef.current.focus();
    }
  }, [isSendDisabled, onSend, text]);

  const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    resizeTextarea(event.target);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="border-t-2 border-gray-300 p-4" data-channel-id={channelId}>
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[44px] max-h-[200px] flex-1 resize-none overflow-y-auto rounded-lg border-2 border-gray-500 p-3 text-base text-gray-900 focus:border-primary-brand focus:outline-none focus:ring-2 focus:ring-primary-brand focus:ring-offset-1"
          style={{ height: `${MIN_TEXTAREA_HEIGHT}px` }}
          rows={1}
        />
        <Button variant="primary" onClick={handleSend} disabled={isSendDisabled}>
          Send
        </Button>
      </div>
      {showCounter && (
        <p className={`mt-2 text-sm ${isOverLimit ? "text-error" : "text-gray-700"}`}>
          {text.length} / {MAX_MESSAGE_LENGTH}
        </p>
      )}
    </div>
  );
}

export default MessageInput;
