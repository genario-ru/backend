import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const IDEAS_LIST_EXPORT_QUEUE_NAME = "ideas-list-export";

export type IdeasListExportJobData = {
  ideasListExportId: string;
};

export const ideasListExportQueue = new Queue<IdeasListExportJobData>(
  IDEAS_LIST_EXPORT_QUEUE_NAME,
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

export function enqueueIdeasListExport(data: IdeasListExportJobData) {
  return ideasListExportQueue.add("export-ideas-list", data);
}
