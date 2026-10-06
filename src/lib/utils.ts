import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseSafeDate(date: any) {
  if (!date) return undefined;
  if (date instanceof Date) return date;
  if (typeof date === "string" && date.startsWith("$D")) {
    return new Date(date.substring(2));
  }
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}
export function formatDateTime(dateTimeString: string | Date) {
  const date = new Date(dateTimeString);

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  const formattedDate = date.toLocaleDateString("en-US", options);
  const formattedTime24 = date.toTimeString().split(" ")[0];
  const formattedTime12 = date.toLocaleTimeString("en-US", { hour12: true });

  return {
    date: formattedDate, // Sun May 26, 2024
    time24: formattedTime24, // 15:04:06
    time12: formattedTime12, // 03:04:06 PM
  };
}
