import { Queue } from "bullmq";

import { redis } from "@/lib/redis";
import type { ProfileChannelStatsData } from "@/lib/socialkit/utils/fetch-profile-channel-stats";

export const PROFILES_FROM_CHANNELS_GENERATION_QUEUE_NAME =
  "profiles-from-channels-generation";

export type ChannelInput = {
  url: string;
  platformId: string;
  platformSlug: string;
  stats: ProfileChannelStatsData;
};

export type ProfilesFromChannelsGenerationJobData = {
  jobId: string;
  userId: string;
  channels: ChannelInput[];
};

export const profilesFromChannelsGenerationQueue =
  new Queue<ProfilesFromChannelsGenerationJobData>(
    PROFILES_FROM_CHANNELS_GENERATION_QUEUE_NAME,
    {
      connection: redis,
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: "exponential",
          delay: 3000,
        },
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    },
  );

export function enqueueProfilesFromChannelsGeneration(
  data: ProfilesFromChannelsGenerationJobData,
) {
  return profilesFromChannelsGenerationQueue.add(
    "profiles-from-channels-generation",
    data,
  );
}
