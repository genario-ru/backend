export type YouTubeChannelIdentifier =
  | { kind: "handle"; handle: string }
  | { kind: "channelId"; channelId: string }
  | { kind: "legacyUsername"; username: string };

export type ParseYouTubeChannelUrlResult =
  | { ok: true; value: YouTubeChannelIdentifier }
  | { ok: false; error: string };

function pathSegments(pathname: string): string[] {
  return pathname.split("/").filter((segment) => segment.length > 0);
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment).trim();
  } catch {
    return segment.trim();
  }
}

/**
 * Извлекает из URL параметры для YouTube Data API v3 `channels.list`.
 * Поддерживает хвосты пути (`/videos`, `/featured`, …): используются только ведущие сегменты канала.
 *
 * **Не валидирует домен и полный формат URL** — ожидается, что строка уже прошла проверку
 * `platform.channelUrlRegex` из БД (справочно см. `platformChannelUrlRegexes` в `src/db/constants`).
 *
 * Ссылки вида `/c/…` не поддерживаются.
 */
export function parseYouTubeChannelUrl(
  rawUrl: string,
): ParseYouTubeChannelUrlResult {
  const trimmed = rawUrl.trim();

  let url: URL;

  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, error: "Invalid URL" };
  }

  const segments = pathSegments(url.pathname);

  if (segments.length === 0) {
    return {
      ok: false,
      error:
        "URL must point to a channel: /@handle, /channel/ID, or /user/name",
    };
  }

  const head = decodeSegment(segments[0]);

  if (head.startsWith("@")) {
    const handle = head.slice(1).trim();

    if (!handle) {
      return { ok: false, error: "Empty channel handle" };
    }

    return { ok: true, value: { kind: "handle", handle } };
  }

  const key = head.toLowerCase();

  if (key === "channel" && segments[1]) {
    const channelId = decodeSegment(segments[1]);

    if (!channelId) {
      return { ok: false, error: "Empty channel id" };
    }

    return { ok: true, value: { kind: "channelId", channelId } };
  }

  if (key === "user" && segments[1]) {
    const username = decodeSegment(segments[1]);

    if (!username) {
      return { ok: false, error: "Empty legacy username" };
    }

    return { ok: true, value: { kind: "legacyUsername", username } };
  }

  return {
    ok: false,
    error: "URL must be a channel path: /@handle, /channel/ID, or /user/name",
  };
}
