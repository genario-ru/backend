export function testString(regex: string, text: string): boolean {
  // eslint-disable-next-line security/detect-non-literal-regexp
  return new RegExp(regex).test(text);
}
