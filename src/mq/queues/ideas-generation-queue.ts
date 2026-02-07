import { Queue } from "bullmq";

import { redis } from "../../lib/redis";

export const IDEAS_GENERATION_QUEUE_NAME = "ideas-generation";

export type IdeasGenerationJobData = {
  ideasListId: string;
  userId: string;
  count: number;
  source: "create" | "update" | "manual";
};

export const ideasGenerationQueue = new Queue<IdeasGenerationJobData>(
  IDEAS_GENERATION_QUEUE_NAME,
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

export function enqueueIdeasGeneration(data: IdeasGenerationJobData) {
  return ideasGenerationQueue.add("generate-ideas", data);
}
