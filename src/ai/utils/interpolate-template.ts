export function interpolate(
  template: string,
  vars: Record<string, string>,
): string {
  // Single pass: each placeholder is replaced once and substituted values are
  // never re-scanned, so user-supplied text containing "{{KEY}}" cannot inject
  // or clobber other placeholders. Unknown placeholders are left untouched.
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : match,
  );
}
