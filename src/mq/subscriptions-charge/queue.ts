import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const SUBSCRIPTIONS_CHARGE_QUEUE_NAME = "subscriptions-charge";

export type SubscriptionsChargeJobData = Record<string, never>;

export const subscriptionsChargeQueue = new Queue<SubscriptionsChargeJobData>(
  SUBSCRIPTIONS_CHARGE_QUEUE_NAME,
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 1,
      removeOnComplete: 50,
      removeOnFail: 100,
    },
  },
);

const SUBSCRIPTIONS_CHARGE_SCHEDULER_ID = "subscriptions-charge-hourly";

export function enqueueSubscriptionsCharge() {
  return subscriptionsChargeQueue.add("charge-subscriptions", {});
}

export function upsertSubscriptionsChargeScheduler() {
  return subscriptionsChargeQueue.upsertJobScheduler(
    SUBSCRIPTIONS_CHARGE_SCHEDULER_ID,
    { pattern: "0 * * * *" },
    { name: "charge-subscriptions", data: {} },
  );
}

export function removeSubscriptionsChargeScheduler() {
  return subscriptionsChargeQueue.removeJobScheduler(
    SUBSCRIPTIONS_CHARGE_SCHEDULER_ID,
  );
}
