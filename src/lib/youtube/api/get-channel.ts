import type { youtube_v3 } from "@googleapis/youtube";

import { youTubeClient } from "@/lib/youtube/client";
import type { YouTubeChannelIdentifier } from "@/lib/youtube/utils/parse-channel-url";

const CHANNEL_LIST_PARTS: string[] = [
  "snippet",
  "contentDetails",
  "statistics",
];

/** YouTube Data API v3 — `channels.list`. */
export async function getChannel(
  identifier: YouTubeChannelIdentifier,
): Promise<youtube_v3.Schema$Channel | null> {
  switch (identifier.kind) {
    case "handle": {
      const { data } = await youTubeClient.channels.list({
        part: CHANNEL_LIST_PARTS,
        forHandle: identifier.handle,
      });

      return data.items?.[0] ?? null;
    }

    case "channelId": {
      const { data } = await youTubeClient.channels.list({
        part: CHANNEL_LIST_PARTS,
        id: [identifier.channelId],
      });

      return data.items?.[0] ?? null;
    }

    case "legacyUsername": {
      const { data } = await youTubeClient.channels.list({
        part: CHANNEL_LIST_PARTS,
        forUsername: identifier.username,
      });

      return data.items?.[0] ?? null;
    }

    default: {
      return null;
    }
  }
}
