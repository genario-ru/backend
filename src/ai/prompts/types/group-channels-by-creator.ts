export type ChannelForGrouping = {
  platformSlug: string;
  name: string;
  description?: string | null;
  recentVideoTitles: string[];
};

export type GroupChannelsByCreatorPromptProps = {
  channels: ChannelForGrouping[];
};
