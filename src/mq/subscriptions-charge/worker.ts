import { Worker } from "bullmq";

import { updateAndChargeSubscriptions } from "@/domains/billing/services/update-and-charge-subscriptions";
import { redis } from "@/lib/redis";
import { getSafeJobLogContext } from "@/shared/utils/mq/get-safe-job-log-context";

import {
  SUBSCRIPTIONS_CHARGE_QUEUE_NAME,
  type SubscriptionsChargeJobData,
} from "./queue";

export const subscriptionsChargeWorker = new Worker<SubscriptionsChargeJobData>(
  SUBSCRIPTIONS_CHARGE_QUEUE_NAME,
  async (job) => {
    console.log("Worker списания подписок запущен", { jobId: job.id });

    await updateAndChargeSubscriptions();
  },
  {
    connection: redis,
    concurrency: 1,
  },
);

subscriptionsChargeWorker.on("error", (error) => {
  console.error("Worker списания подписок отработал с ошибкой", error);
});

subscriptionsChargeWorker.on("failed", (job, error) => {
  console.error(
    "Worker списания подписок упал с ошибкой",
    getSafeJobLogContext(job),
    error,
  );
});

subscriptionsChargeWorker.on("completed", (job) => {
  console.log("Worker списания подписок отработал успешно", job.id);
});
