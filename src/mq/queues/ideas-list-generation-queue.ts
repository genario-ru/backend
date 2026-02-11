import { Queue } from "bullmq";

import { redis } from "../../lib/redis";

export const IDEAS_LIST_GENERATION_QUEUE_NAME = "ideas-list-generation";

export type IdeasListGenerationJobData = {
  ideasListId: string;
  userId: string;
  userPrompt?: string | null;
  count: number;
  source: "create" | "update" | "manual";
};

export const ideasListGenerationQueue = new Queue<IdeasListGenerationJobData>(
  IDEAS_LIST_GENERATION_QUEUE_NAME,
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

export function enqueueIdeasListGeneration(data: IdeasListGenerationJobData) {
  return ideasListGenerationQueue.add("generate-ideas-list", data);
}
