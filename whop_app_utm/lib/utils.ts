// Minimal className merge helper used by shadcn-style UI components.
// This avoids extra dependencies while still supporting simple conditional classes.

export type ClassValue = string | number | null | false | undefined;

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .filter((value) => typeof value === "string" || typeof value === "number")
    .map((value) => String(value))
    .join(" ");
}
