import type { ChannelIdentifier } from "../types/channel-identifier";

export function extractChannelIdentifier(
  url: string,
): ChannelIdentifier | null {
  try {
    const segments = new URL(url).pathname
      .split("/")
      .filter(Boolean)
      .map((s) => decodeURIComponent(s).trim());

    if (!segments.length) return null;

    const head = segments[0];

    if (head.startsWith("@")) {
      const handle = head.slice(1);

      return handle ? { kind: "handle", handle } : null;
    }

    const key = head.toLowerCase();

    if (key === "channel" && segments[1]) {
      return {
        kind: "channelId",
        channelId: segments[1],
      };
    }

    if (key === "user" && segments[1]) {
      return {
        kind: "legacyUsername",
        username: segments[1],
      };
    }

    return null;
  } catch {
    return null;
  }
}
