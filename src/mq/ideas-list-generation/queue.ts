import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const IDEAS_LIST_GENERATION_QUEUE_NAME = "ideas-list-generation";

const REMOVE_ON_COMPLETE = {
  age: 60 * 60,
  count: 10,
};

const REMOVE_ON_FAIL = {
  age: 60 * 60 * 24,
  count: 20,
};

export type IdeasListGenerationJobData = {
  ideasListId: string;
  userId: string;
  userPrompt?: string | null;
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
      removeOnComplete: REMOVE_ON_COMPLETE,
      removeOnFail: REMOVE_ON_FAIL,
    },
  },
);

export function enqueueIdeasListGeneration(data: IdeasListGenerationJobData) {
  return ideasListGenerationQueue.add("generate-ideas-list", data);
}
