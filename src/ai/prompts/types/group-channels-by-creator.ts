export type ChannelVideoForGrouping = {
  title: string;
  summary?: string | null;
  mainTopics?: string[];
  tone?: string | null;
};

export type ChannelForGrouping = {
  platformSlug: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  verified?: boolean | null;
  followers?: number | null;
  recentVideoTitles: string[];
  recentVideos?: ChannelVideoForGrouping[];
};

export type GroupChannelsByCreatorPromptProps = {
  channels: ChannelForGrouping[];
};
