import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const UPCOMING_CHARGES_NEWSLETTER_QUEUE_NAME =
  "upcoming-charges-newsletter";

export type UpcomingChargesNewsletterJobData = Record<string, never>;

export const upcomingChargesNewsletterQueue =
  new Queue<UpcomingChargesNewsletterJobData>(
    UPCOMING_CHARGES_NEWSLETTER_QUEUE_NAME,
    {
      connection: redis,
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    },
  );

const UPCOMING_CHARGES_NEWSLETTER_SCHEDULER_ID =
  "upcoming-charges-newsletter-hourly";

export function enqueueUpcomingChargesNewsletter() {
  return upcomingChargesNewsletterQueue.add(
    "send-upcoming-charges-newsletter",
    {},
  );
}

export function upsertUpcomingChargesNewsletterScheduler() {
  return upcomingChargesNewsletterQueue.upsertJobScheduler(
    UPCOMING_CHARGES_NEWSLETTER_SCHEDULER_ID,
    { pattern: "0 * * * *" },
    { name: "send-upcoming-charges-newsletter", data: {} },
  );
}

export function removeUpcomingChargesNewsletterScheduler() {
  return upcomingChargesNewsletterQueue.removeJobScheduler(
    UPCOMING_CHARGES_NEWSLETTER_SCHEDULER_ID,
  );
}
