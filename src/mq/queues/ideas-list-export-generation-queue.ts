import { Queue } from "bullmq";

import { redis } from "../../lib/redis";

export const IDEAS_LIST_EXPORT_GENERATION_QUEUE_NAME =
  "ideas-list-export-generation";

export type IdeasListExportGenerationJobData = {
  ideasListExportId: string;
};

export const ideasListExportGenerationQueue =
  new Queue<IdeasListExportGenerationJobData>(
    IDEAS_LIST_EXPORT_GENERATION_QUEUE_NAME,
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

export function enqueueIdeasListExportGeneration(
  data: IdeasListExportGenerationJobData,
) {
  return ideasListExportGenerationQueue.add("generate-ideas-list-export", data);
}
