import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const PROFILES_FROM_CHANNELS_GENERATION_QUEUE_NAME =
  "profiles-from-channels-generation";

export type ProfilesFromChannelsGenerationJobData = {
  userId: string;
  channelUrls: string[];
};

export const profilesFromChannelsGenerationQueue =
  new Queue<ProfilesFromChannelsGenerationJobData>(
    PROFILES_FROM_CHANNELS_GENERATION_QUEUE_NAME,
    {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
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
