import type { youtube_v3 } from "@googleapis/youtube";

export type GetChannelVideosOptions = {
  maxResults?: number;
  pageToken?: string;
};

export type GetChannelVideosResult = {
  items: youtube_v3.Schema$PlaylistItem[];
  nextPageToken?: string | null;
};
