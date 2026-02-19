import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { Timestamp } from "firebase/firestore";

export function formatRelativeTime(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  const now = new Date();

  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  if (isYesterday(date)) {
    return `Yesterday at ${format(date, "h:mm a")}`;
  }

  if (now.getFullYear() === date.getFullYear()) {
    return format(date, "MMM d");
  }

  return format(date, "MMM d, yyyy");
}
