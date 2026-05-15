import type { Job } from "bullmq";

export async function isFinalJobFailure(job?: Job | null) {
  if (!job) {
    return false;
  }

  try {
    return await job.isFailed();
  } catch {
    return job.finishedOn !== undefined;
  }
}
