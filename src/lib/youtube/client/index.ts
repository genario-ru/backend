import { youtube, type youtube_v3 } from "@googleapis/youtube";

import { envs } from "@/constants/common/envs";

export type YouTubeClient = youtube_v3.Youtube;

/**
 * YouTube Data API v3 client authenticated with a server API key (`YOUTUBE_API_KEY`).
 * Suitable for public data only (channels, public videos, playlists).
 */
export const youTubeClient: YouTubeClient = youtube({
  version: "v3",
  auth: envs.YOUTUBE_API_KEY,
});
