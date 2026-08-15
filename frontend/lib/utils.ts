import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely parses UTC dates (including SQLite strings without timezone designator like "YYYY-MM-DD HH:MM:SS")
 * into a JavaScript Date object so formatting is correctly rendered in the user's local timezone.
 */
export function parseUTCDate(dateInput: string | Date | null | undefined): Date {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;
  let s = String(dateInput).trim();
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/.test(s)) {
    s = s.replace(" ", "T");
  }
  if (!/[Z+-]\d{2}:?\d{2}$|Z$/.test(s)) {
    s += "Z";
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date(dateInput) : d;
}
