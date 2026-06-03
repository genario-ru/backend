import { Worker } from "bullmq";

import { initiateUpcomingChargesNewsletter } from "@/domains/billing/services/initiate-upcoming-charges-newsletter";
import { redis } from "@/lib/redis";
import { getSafeJobLogContext } from "@/shared/utils/mq/get-safe-job-log-context";

import {
  UPCOMING_CHARGES_NEWSLETTER_QUEUE_NAME,
  type UpcomingChargesNewsletterJobData,
} from "./queue";

export const upcomingChargesNewsletterWorker =
  new Worker<UpcomingChargesNewsletterJobData>(
    UPCOMING_CHARGES_NEWSLETTER_QUEUE_NAME,
    async (job) => {
      console.log("Worker рассылки о предстоящих списаниях запущен", {
        jobId: job.id,
      });

      await initiateUpcomingChargesNewsletter();
    },
    {
      connection: redis,
      concurrency: 1,
    },
  );

upcomingChargesNewsletterWorker.on("error", (error) => {
  console.error(
    "Worker рассылки о предстоящих списаниях отработал с ошибкой",
    error,
  );
});

upcomingChargesNewsletterWorker.on("failed", (job, error) => {
  console.error(
    "Worker рассылки о предстоящих списаниях упал с ошибкой",
    getSafeJobLogContext(job),
    error,
  );
});

upcomingChargesNewsletterWorker.on("completed", (job) => {
  console.log(
    "Worker рассылки о предстоящих списаниях отработал успешно",
    job.id,
  );
});
