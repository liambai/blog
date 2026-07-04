// Format a post date as e.g. "May 21, 2025". UTC avoids off-by-one drift from
// the reader's local timezone (dates are authored as plain YYYY-MM-DD).
export function formatPostDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}
