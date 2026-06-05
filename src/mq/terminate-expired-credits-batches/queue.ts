import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const TERMINATE_EXPIRED_CREDITS_BATCHES_QUEUE_NAME =
  "terminate-expired-credits-batches";

export type TerminateExpiredCreditsBatchesJobData = Record<string, never>;

export const terminateExpiredCreditsBatchesQueue =
  new Queue<TerminateExpiredCreditsBatchesJobData>(
    TERMINATE_EXPIRED_CREDITS_BATCHES_QUEUE_NAME,
    {
      connection: redis,
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    },
  );

const TERMINATE_EXPIRED_CREDITS_BATCHES_SCHEDULER_ID =
  "terminate-expired-credits-batches-hourly";

export function enqueueTerminateExpiredCreditsBatches() {
  return terminateExpiredCreditsBatchesQueue.add(
    "terminate-expired-credits-batches",
    {},
  );
}

export function upsertTerminateExpiredCreditsBatchesScheduler() {
  return terminateExpiredCreditsBatchesQueue.upsertJobScheduler(
    TERMINATE_EXPIRED_CREDITS_BATCHES_SCHEDULER_ID,
    { pattern: "0 * * * *" },
    { name: "terminate-expired-credits-batches", data: {} },
  );
}

export function removeTerminateExpiredCreditsBatchesScheduler() {
  return terminateExpiredCreditsBatchesQueue.removeJobScheduler(
    TERMINATE_EXPIRED_CREDITS_BATCHES_SCHEDULER_ID,
  );
}
