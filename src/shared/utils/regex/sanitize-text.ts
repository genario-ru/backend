export function sanitizeText(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/[\u0080-\u009F]/g, "")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u2022/g, "-");
}
