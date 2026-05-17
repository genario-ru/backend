import type { Context } from "hono";

type HeadersWithGetSetCookie = Headers & {
  getSetCookie?: () => string[];
};

export function applyAuthApiHeaders(c: Context, headers: Headers) {
  const headersWithGetSetCookie = headers as HeadersWithGetSetCookie;

  const setCookies =
    typeof headersWithGetSetCookie.getSetCookie === "function"
      ? headersWithGetSetCookie.getSetCookie()
      : [];

  for (const cookie of setCookies) {
    c.header("Set-Cookie", cookie, { append: true });
  }

  headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      return;
    }

    c.header(key, value);
  });
}
