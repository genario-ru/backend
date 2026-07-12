import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const PROFILE_ATTACHMENT_VIDEO_PROCESSING_QUEUE_NAME =
  "profile-attachment-video-processing";

export type ProfileAttachmentVideoProcessingJobData = {
  profileAttachmentId: string;
};

export const profileAttachmentVideoProcessingQueue =
  new Queue<ProfileAttachmentVideoProcessingJobData>(
    PROFILE_ATTACHMENT_VIDEO_PROCESSING_QUEUE_NAME,
    {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 3000,
        },
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    },
  );

export function enqueueProfileAttachmentVideoProcessing(
  data: ProfileAttachmentVideoProcessingJobData,
) {
  return profileAttachmentVideoProcessingQueue.add(
    "process-profile-attachment-video",
    data,
    {
      jobId: data.profileAttachmentId,
    },
  );
}
