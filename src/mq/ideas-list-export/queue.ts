import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const IDEAS_LIST_EXPORT_QUEUE_NAME = "ideas-list-export";

const REMOVE_ON_COMPLETE = {
  age: 60 * 60,
  count: 10,
};

const REMOVE_ON_FAIL = {
  age: 60 * 60 * 24,
  count: 20,
};

export type IdeasListExportJobData = {
  exportDocumentId: string;
  ideasListId: string;
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
      removeOnComplete: REMOVE_ON_COMPLETE,
      removeOnFail: REMOVE_ON_FAIL,
    },
  },
);

export function enqueueIdeasListExport(data: IdeasListExportJobData) {
  return ideasListExportQueue.add("export-ideas-list", data);
}
