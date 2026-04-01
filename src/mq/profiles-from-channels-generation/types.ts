import type { ChannelDataInput } from "@/ai/prompts/types/generate-profile-from-channels";

import type { ChannelInput } from "./queue";

export type FetchedChannelVideo = {
  internalId: string;
  url: string;
  thumbnailUrl: string | null;
  name: string;
  description: string | null;
};

export type FetchedChannel = {
  input: ChannelInput;
  data: ChannelDataInput;
  internalId: string;
  slug: string | null;
  avatarUrl: string | null;
  name: string;
  description: string | null;
  videos: FetchedChannelVideo[];
};
