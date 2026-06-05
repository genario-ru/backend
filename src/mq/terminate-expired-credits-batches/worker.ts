import { Worker } from "bullmq";

import { terminateExpiredCreditsBatches } from "@/domains/billing/services/terminate-expired-credits-batches";
import { redis } from "@/lib/redis";
import { getSafeJobLogContext } from "@/shared/utils/mq/get-safe-job-log-context";

import {
  TERMINATE_EXPIRED_CREDITS_BATCHES_QUEUE_NAME,
  type TerminateExpiredCreditsBatchesJobData,
} from "./queue";

export const terminateExpiredCreditsBatchesWorker =
  new Worker<TerminateExpiredCreditsBatchesJobData>(
    TERMINATE_EXPIRED_CREDITS_BATCHES_QUEUE_NAME,
    async (job) => {
      console.log("Expired credits batches termination worker started", {
        jobId: job.id,
      });

      await terminateExpiredCreditsBatches();
    },
    {
      connection: redis,
      concurrency: 1,
    },
  );

terminateExpiredCreditsBatchesWorker.on("error", (error) => {
  console.error("Expired credits batches termination worker errored", error);
});

terminateExpiredCreditsBatchesWorker.on("failed", (job, error) => {
  console.error(
    "Expired credits batches termination worker failed",
    getSafeJobLogContext(job),
    error,
  );
});

terminateExpiredCreditsBatchesWorker.on("completed", (job) => {
  console.log(
    "Expired credits batches termination worker completed successfully",
    job.id,
  );
});
