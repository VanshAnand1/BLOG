export function datetime(timestamp: string | null | undefined): string {
  if (!timestamp) return "Invalid Date";
  try {
    const date = new Date(timestamp);
    const userTimeZone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York";

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: userTimeZone,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return formatter.format(date);
  } catch (err) {
    console.error("Failed to format timestamp:", err);
    return "Invalid Date";
  }
}
