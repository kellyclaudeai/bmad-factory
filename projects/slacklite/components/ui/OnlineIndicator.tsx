interface OnlineIndicatorProps {
  isOnline: boolean;
}

export default function OnlineIndicator({ isOnline }: OnlineIndicatorProps) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full border-2 border-white ${
        isOnline ? "bg-success" : "bg-gray-600"
      }`}
      aria-label={isOnline ? "Online" : "Offline"}
      role="status"
    />
  );
}
