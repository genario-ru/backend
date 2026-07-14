import type { Platform } from "@/domains/platforms/schemas/entities/platform";
import type { ProfileChannelStatsData } from "@/lib/socialkit/utils/fetch-profile-channel-stats";

export type ResolvedProfileChannel = {
  url: string;
  platform: Platform;
  stats: ProfileChannelStatsData;
};

type ResolveProfileChannelErrorResult = {
  status: "error";
  url: string;
  statusDetails: string;
};

type ResolveProfileChannelSuccessResult = {
  status: "success";
  data: ResolvedProfileChannel;
};

export type ResolveProfileChannelResult =
  | ResolveProfileChannelErrorResult
  | ResolveProfileChannelSuccessResult;
