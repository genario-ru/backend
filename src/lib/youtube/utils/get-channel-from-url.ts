import type { youtube_v3 } from "@googleapis/youtube";

import { getChannel } from "@/lib/youtube/api/get-channel";
import { parseYouTubeChannelUrl } from "@/lib/youtube/utils/parse-channel-url";

export type GetChannelFromUrlResult =
  | { ok: true; channel: youtube_v3.Schema$Channel }
  | { ok: false; error: string };

/** Парсинг URL + вызов `getChannel` (`channels.list`). */
export async function getChannelFromUrl(
  channelUrl: string,
): Promise<GetChannelFromUrlResult> {
  const parsed = parseYouTubeChannelUrl(channelUrl);

  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const channel = await getChannel(parsed.value);

  if (!channel) {
    return { ok: false, error: "Channel not found" };
  }

  return { ok: true, channel };
}
