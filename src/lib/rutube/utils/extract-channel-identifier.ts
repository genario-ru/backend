import type { ChannelIdentifier } from "../types/channel-identifier";

export function extractChannelIdentifier(
  url: string,
): ChannelIdentifier | null {
  try {
    const segments = new URL(url).pathname.split("/").filter(Boolean);
    const authorId = segments[1] ? decodeURIComponent(segments[1]) : null;

    if (!authorId) return null;

    return {
      kind: "authorId",
      authorId,
    };
  } catch {
    return null;
  }
}
