import { differenceInCalendarDays, format, isToday, isYesterday } from "date-fns";
import { Timestamp } from "firebase/firestore";

/**
 * Returns milliseconds from a Firestore Timestamp or a numeric Unix-ms value.
 */
function getMs(timestamp: Timestamp | number | null | undefined): number {
  if (!timestamp) return 0;
  if (typeof (timestamp as Timestamp).toMillis === "function") {
    return (timestamp as Timestamp).toMillis();
  }
  return timestamp as number;
}

/**
 * Full timestamp: "Today at 2:05 PM", "Yesterday at…", or "Jan 3 at 9:00 AM".
 * Falls back to empty string for null/undefined.
 */
export function formatTimestamp(timestamp: Timestamp | number | null | undefined): string {
  const ms = getMs(timestamp);
  if (!ms) return "";
  const date = new Date(ms);
  return formatRelativeTime(
    typeof (timestamp as Timestamp).toDate === "function"
      ? (timestamp as Timestamp)
      : Timestamp.fromMillis(ms)
  );
}

/**
 * Short timestamp: "2:05 PM" — used for continuation-message hover labels.
 */
export function formatTimeShort(timestamp: Timestamp | number | null | undefined): string {
  const ms = getMs(timestamp);
  if (!ms) return "";
  const date = new Date(ms);
  return format(date, "h:mm a");
}

export function formatRelativeTime(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  const now = new Date();
  const millisecondsDifference = now.getTime() - date.getTime();
  const oneMinuteInMilliseconds = 60 * 1000;
  const oneHourInMilliseconds = 60 * oneMinuteInMilliseconds;
  const daysDifference = differenceInCalendarDays(now, date);

  if (millisecondsDifference >= 0 && millisecondsDifference < oneHourInMilliseconds) {
    const minutesAgo = Math.max(
      1,
      Math.floor(millisecondsDifference / oneMinuteInMilliseconds),
    );

    return `${minutesAgo} min ago`;
  }

  if (isToday(date)) {
    return `Today at ${format(date, "h:mm a")}`;
  }

  if (isYesterday(date)) {
    return `Yesterday at ${format(date, "h:mm a")}`;
  }

  if (daysDifference > 1 && daysDifference < 7) {
    return format(date, "EEEE 'at' h:mm a");
  }

  if (now.getFullYear() === date.getFullYear()) {
    return format(date, "MMM d");
  }

  return format(date, "MMM d, yyyy");
}
