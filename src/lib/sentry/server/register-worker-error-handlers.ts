import type { Job, Worker as SentryWorker } from "bullmq";

import { isFinalJobFailure } from "@/shared/utils/mq/is-final-job-failure";

import { captureWorkerError } from "./capture-worker-error";

export function registerWorkerErrorHandlers(workers: SentryWorker[]) {
  workers.forEach((worker) => {
    worker.on("error", (error) => {
      captureWorkerError({
        error,
        queueName: worker.name,
      });
    });

    worker.on("failed", async (job: Job | undefined, error: Error) => {
      const isFinalFailure = await isFinalJobFailure(job);

      if (!isFinalFailure) {
        return;
      }

      captureWorkerError({
        error,
        job,
        queueName: job?.queueName ?? worker.name,
      });
    });
  });
}
