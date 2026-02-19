import { differenceInCalendarDays, format, isToday, isYesterday } from "date-fns";
import { Timestamp } from "firebase/firestore";

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
