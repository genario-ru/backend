import { Worker } from "bullmq";

import { redis } from "@/lib/redis";

import {
  PROFILES_FROM_CHANNELS_GENERATION_QUEUE_NAME,
  type ProfilesFromChannelsGenerationJobData,
} from "./queue";

export const profilesFromChannelsGenerationWorker =
  new Worker<ProfilesFromChannelsGenerationJobData>(
    PROFILES_FROM_CHANNELS_GENERATION_QUEUE_NAME,
    async (job) => {
      const { userId, channelUrls } = job.data;

      try {
        // Logic
        console.log({
          userId,
          channelUrls,
        });
      } catch (error) {
        // Error logic
        console.error(error);
      }
    },
    {
      concurrency: 5,
      connection: redis,
    },
  );

profilesFromChannelsGenerationWorker.on("error", (error) => {
  console.error("Profiles from channels generation worker error", error);
});

profilesFromChannelsGenerationWorker.on("failed", (job, error) => {
  console.error(
    "Profiles from channels generation worker failed",
    job?.toJSON(),
    error,
  );
});

profilesFromChannelsGenerationWorker.on("completed", (job) => {
  console.log("Profiles from channels generation worker completed", job.id);
});
