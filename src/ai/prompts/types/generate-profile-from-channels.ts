export type ChannelVideoInput = {
  title: string;
  description?: string | null;
  summary?: string | null;
  mainTopics?: string[];
  keyPoints?: string[];
  tone?: string | null;
  transcript?: string | null;
};

export type ChannelDataInput = {
  platformSlug: string;
  name: string;
  description?: string | null;
  slug?: string | null;
  verified?: boolean | null;
  followers?: number | null;
  subscribersCount?: number | null;
  videoCount?: number | null;
  recentVideos: ChannelVideoInput[];
};

export type ToneInput = {
  id: string;
  name: string;
  description?: string | null;
};

export type GenerateProfileFromChannelsPromptProps = {
  channels: ChannelDataInput[];
  availableTones: ToneInput[];
};
