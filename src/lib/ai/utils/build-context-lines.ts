type ContextEntry = [label: string, value: string | null | undefined];

export function buildContextLines(entries: ContextEntry[]): string {
  return entries
    .filter(
      ([, value]) =>
        value !== null && value !== undefined && value.trim() !== "",
    )
    .map(([label, value]) => `- ${label}: ${value}`)
    .join("\n");
}

export function formatPreviousItems<T extends Record<string, unknown>>(
  items: T[] | undefined | null,
  formatter: (item: T, index: number) => string,
): string {
  if (!items || items.length === 0) return "none";
  return items.map((item, i) => formatter(item, i)).join("\n");
}
