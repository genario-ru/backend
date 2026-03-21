export function prepareHeaderValue(value: string, prefix?: string): string;
export function prepareHeaderValue(
  value?: string | null,
  prefix?: string,
): string | undefined;

export function prepareHeaderValue(
  value?: string | null,
  prefix?: string,
): string | undefined {
  if (value) {
    return prefix ? `${prefix}${value}` : value;
  }

  return undefined;
}

export function prepareAuthHeaderValue(value: string) {
  return prepareHeaderValue(value, "Bearer ");
}
