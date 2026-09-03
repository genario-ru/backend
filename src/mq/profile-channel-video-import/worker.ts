import { Worker } from "bullmq";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profileChannelVideo } from "@/db/schema";
import { redis } from "@/lib/redis";
import {
  fetchProfileChannelVideoSummarize,
  fetchProfileChannelVideoTranscript,
} from "@/lib/socialkit/utils/fetch-profile-channel-video-enrichment";
import { getSafeJobLogContext } from "@/shared/utils/mq/get-safe-job-log-context";
import { isFinalJobFailure } from "@/shared/utils/mq/is-final-job-failure";

import {
  PROFILE_CHANNEL_VIDEO_IMPORT_QUEUE_NAME,
  type ProfileChannelVideoImportJobData,
} from "./queue";

export const profileChannelVideoImportWorker =
  new Worker<ProfileChannelVideoImportJobData>(
    PROFILE_CHANNEL_VIDEO_IMPORT_QUEUE_NAME,
    async (job) => {
      const { profileChannelVideoId, url, platformSlug } = job.data;

      console.log("Worker импорта видео профиля запущен", {
        profileChannelVideoId,
        platformSlug,
        jobId: job.id,
      });

      const foundVideo = await db.query.profileChannelVideo.findFirst({
        where: (video, { eq }) => eq(video.id, profileChannelVideoId),
      });

      if (!foundVideo) {
        throw new Error(
          `Видео профиля с id ${profileChannelVideoId} не найдено`,
        );
      }

      const [summarizeData, transcriptData] = await Promise.all([
        fetchProfileChannelVideoSummarize({ url, platformSlug }),
        fetchProfileChannelVideoTranscript({ url, platformSlug }),
      ]);

      await db
        .update(profileChannelVideo)
        .set({
          summary: summarizeData.summary,
          mainTopics: summarizeData.mainTopics,
          keyPoints: summarizeData.keyPoints,
          tone: summarizeData.tone,
          targetAudience: summarizeData.targetAudience,
          quotes: summarizeData.quotes,
          transcript: transcriptData.transcript,
          transcriptSegments: transcriptData.transcriptSegments,
          wordCount: transcriptData.wordCount,
          segments: transcriptData.segments,
          timeline: transcriptData.timeline,
        })
        .where(eq(profileChannelVideo.id, profileChannelVideoId));

      console.log("Импорт summary и transcript для видео профиля завершён", {
        profileChannelVideoId,
        jobId: job.id,
      });
    },
    {
      concurrency: 5,
      connection: redis,
    },
  );

profileChannelVideoImportWorker.on("error", (error) => {
  console.error("Worker импорта видео профиля упал с ошибкой", error);
});

profileChannelVideoImportWorker.on("failed", async (job, error) => {
  console.error(
    "Worker импорта видео профиля упал с ошибкой",
    getSafeJobLogContext(job),
    error,
  );

  const isFinalFailure = await isFinalJobFailure(job);

  if (!job || !isFinalFailure) {
    return;
  }

  console.error(
    "Импорт summary и transcript для видео профиля окончательно не удался",
    {
      profileChannelVideoId: job.data.profileChannelVideoId,
      jobId: job.id,
    },
  );
});

profileChannelVideoImportWorker.on("completed", (job) => {
  console.log("Worker импорта видео профиля отработал успешно", job.id);
});
