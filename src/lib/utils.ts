import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Logged time, e.g. 23400 -> "6h 30m", 2700 -> "45m", 0 -> "0m".
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

// Plain minutes, e.g. 75 -> "1h 15m", 30 -> "30m", 0 -> "0m".
export function formatMinutesPlain(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Estimated remaining, e.g. 120 -> "~2h", 45 -> "~45m", 150 -> "~2h 30m".
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `~${mins}m`;
  if (mins === 0) return `~${hours}h`;
  return `~${hours}h ${mins}m`;
}
