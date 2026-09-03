import type { ChannelDataInput } from "@/ai/prompts/types/generate-profile-from-channels";
import type {
  ProfileChannelVideoSummarizeData,
  ProfileChannelVideoTranscriptData,
} from "@/lib/socialkit/utils/fetch-profile-channel-video-enrichment";

import type { ChannelInput } from "./queue";

export type FetchedChannelVideoEnrichment = ProfileChannelVideoSummarizeData &
  ProfileChannelVideoTranscriptData;

export type FetchedChannelVideo = {
  externalId: string | null;
  url: string | null;
  thumbnailUrl: string | null;
  name: string | null;
  description: string | null;
  likes: number | null;
  views: number | null;
  comments: number | null;
  duration: string | null;
  enrichment: FetchedChannelVideoEnrichment | null;
};

export type FetchedChannel = {
  input: ChannelInput;
  data: ChannelDataInput;
  externalId: string;
  slug: string | null;
  avatarUrl: string | null;
  name: string;
  description: string | null;
  verified: boolean | null;
  followers: number | null;
  following: number | null;
  totalPosts: number | null;
  videos: FetchedChannelVideo[];
};
