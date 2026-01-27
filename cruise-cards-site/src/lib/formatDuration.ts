export function formatDurationLabel(cruiseLine: string | null | undefined, nights: number | null | undefined) {
  if (!nights) return "TBD";
  const line = cruiseLine?.toLowerCase() ?? "";
  if (line.includes("carnival")) {
    return `${nights + 1}-Day`;
  }
  return `${nights}-Night`;
}
