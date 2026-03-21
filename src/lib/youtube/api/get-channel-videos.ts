import type { youtube_v3 } from "@googleapis/youtube";

import { youTubeClient } from "@/lib/youtube/client";

const PLAYLIST_ITEM_PARTS: string[] = ["snippet", "contentDetails"];

export type GetChannelVideosOptions = {
  maxResults?: number;
  pageToken?: string;
};

export type GetChannelVideosResult = {
  items: youtube_v3.Schema$PlaylistItem[];
  nextPageToken?: string | null;
};

/** YouTube Data API v3 — `playlistItems.list` (плейлист uploads канала). */
export async function getChannelVideos(
  channel: youtube_v3.Schema$Channel,
  options: GetChannelVideosOptions = {},
): Promise<GetChannelVideosResult> {
  const uploadsPlaylistId =
    channel.contentDetails?.relatedPlaylists?.uploads ?? undefined;

  if (!uploadsPlaylistId) {
    return { items: [], nextPageToken: undefined };
  }

  const { maxResults = 25, pageToken } = options;

  const { data } = await youTubeClient.playlistItems.list({
    part: PLAYLIST_ITEM_PARTS,
    playlistId: uploadsPlaylistId,
    maxResults: Math.min(Math.max(maxResults, 1), 50),
    pageToken,
  });

  return {
    items: data.items ?? [],
    nextPageToken: data.nextPageToken ?? undefined,
  };
}
