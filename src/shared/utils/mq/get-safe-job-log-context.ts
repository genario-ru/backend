import type { Job } from "bullmq";

export function getSafeJobLogContext(job?: Job | null) {
  if (!job) {
    return null;
  }

  return {
    id: job.id,
    name: job.name,
    queueName: job.queueName,
    attemptsMade: job.attemptsMade,
  };
}
