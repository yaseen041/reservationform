import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(
  ...inputs: (
    | string
    | undefined
    | null
    | boolean
    | { [key: string]: boolean }
  )[]
): string {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

export function formatDateForSummary(dateString: string | undefined): string {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${month}/${day}/${year}`;
}

export function formatTime(timeString: string): string {
  if (!timeString) return "";

  // Create a Date object for today's date with the given time
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));

  // Use toLocaleTimeString to format the time
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Formats a phone number string into a readable US format
 * @param phoneNumber - The raw phone number string (e.g., "12345678901")
 * @returns Formatted phone number string (e.g., "(234) 567-8901")
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove the country code if it exists (assuming US +1)
  let cleaned = phoneNumber.replace(/\D/g, "");

  // If the number starts with 1 (US country code), remove it for formatting
  if (cleaned.startsWith("1") && cleaned.length > 10) {
    cleaned = cleaned.substring(1);
  }

  // Format the number as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
  }

  // If the number doesn't match the expected format, return it as is
  return phoneNumber;
};
