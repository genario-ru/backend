import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const PROFILE_VIDEO_ATTACHMENT_ENRICHMENT_QUEUE_NAME =
  "profile-video-attachment-enrichment";

export type ProfileVideoAttachmentEnrichmentJobData = {
  profileVideoAttachmentId: string;
};

export const profileVideoAttachmentEnrichmentQueue =
  new Queue<ProfileVideoAttachmentEnrichmentJobData>(
    PROFILE_VIDEO_ATTACHMENT_ENRICHMENT_QUEUE_NAME,
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

export function enqueueProfileVideoAttachmentEnrichment(
  data: ProfileVideoAttachmentEnrichmentJobData,
) {
  return profileVideoAttachmentEnrichmentQueue.add(
    "enrich-profile-video-attachment",
    data,
  );
}
