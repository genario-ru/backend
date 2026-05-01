type OptionSource = { id: string; name?: string | null; slug?: string | null };

export function toOptions(items: OptionSource[]) {
  return items.map((item) => ({
    label: item.name ?? item.slug ?? item.id,
    value: item.id,
  }));
}
