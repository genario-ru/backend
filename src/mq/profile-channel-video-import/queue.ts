import { Queue } from "bullmq";

import { redis } from "@/lib/redis";
import type { SocialKitVideoPlatformSlug } from "@/lib/socialkit/types/video-platform-slug";

export const PROFILE_CHANNEL_VIDEO_IMPORT_QUEUE_NAME =
  "profile-channel-video-import";

export type ProfileChannelVideoImportJobData = {
  profileChannelVideoId: string;
  url: string;
  platformSlug: SocialKitVideoPlatformSlug;
};

export const profileChannelVideoImportQueue =
  new Queue<ProfileChannelVideoImportJobData>(
    PROFILE_CHANNEL_VIDEO_IMPORT_QUEUE_NAME,
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

export function enqueueProfileChannelVideoImport(
  data: ProfileChannelVideoImportJobData,
) {
  return profileChannelVideoImportQueue.add(
    "import-profile-channel-video",
    data,
  );
}
