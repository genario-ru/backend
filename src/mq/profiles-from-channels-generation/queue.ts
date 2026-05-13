import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const PROFILES_FROM_CHANNELS_GENERATION_QUEUE_NAME =
  "profiles-from-channels-generation";

const REMOVE_ON_COMPLETE = {
  age: 60 * 60,
  count: 10,
};

const REMOVE_ON_FAIL = {
  age: 60 * 60 * 24,
  count: 20,
};

export type ChannelInput = {
  url: string;
  platformId: string;
  platformSlug: string;
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
        removeOnComplete: REMOVE_ON_COMPLETE,
        removeOnFail: REMOVE_ON_FAIL,
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
