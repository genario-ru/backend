import { Worker } from "bullmq";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profileVideoAttachment } from "@/db/schema";
import { redis } from "@/lib/redis";
import { getSignedS3Url } from "@/lib/s3/utils/get-signed-s3-url";
import {
  fetchProfileVideoAttachmentSummarize,
  fetchProfileVideoAttachmentTranscript,
} from "@/lib/socialkit/utils/fetch-profile-video-attachment-enrichment";
import { getSafeJobLogContext } from "@/shared/utils/mq/get-safe-job-log-context";
import { isFinalJobFailure } from "@/shared/utils/mq/is-final-job-failure";

import {
  PROFILE_VIDEO_ATTACHMENT_ENRICHMENT_QUEUE_NAME,
  type ProfileVideoAttachmentEnrichmentJobData,
} from "./queue";

export const profileVideoAttachmentEnrichmentWorker =
  new Worker<ProfileVideoAttachmentEnrichmentJobData>(
    PROFILE_VIDEO_ATTACHMENT_ENRICHMENT_QUEUE_NAME,
    async (job) => {
      const { profileVideoAttachmentId } = job.data;

      console.log("Worker обогащения видео-вложения профиля запущен", {
        profileVideoAttachmentId,
        jobId: job.id,
      });

      const foundVideoAttachment =
        await db.query.profileVideoAttachment.findFirst({
          where: (videoAttachment, { eq: eqFn }) =>
            eqFn(videoAttachment.id, profileVideoAttachmentId),
          with: {
            attachment: true,
          },
        });

      if (!foundVideoAttachment) {
        throw new Error(
          `Видео-вложение профиля с id ${profileVideoAttachmentId} не найдено`,
        );
      }

      const signedUrl = await getSignedS3Url(
        foundVideoAttachment.attachment.key,
      );

      const [summarizeData, transcriptData] = await Promise.all([
        fetchProfileVideoAttachmentSummarize({ url: signedUrl }),
        fetchProfileVideoAttachmentTranscript({ url: signedUrl }),
      ]);

      await db
        .update(profileVideoAttachment)
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
        .where(eq(profileVideoAttachment.id, profileVideoAttachmentId));

      console.log(
        "Обогащение summary и transcript для видео-вложения профиля завершено",
        {
          profileVideoAttachmentId,
          jobId: job.id,
        },
      );
    },
    {
      concurrency: 5,
      connection: redis,
    },
  );

profileVideoAttachmentEnrichmentWorker.on("error", (error) => {
  console.error(
    "Worker обогащения видео-вложения профиля упал с ошибкой",
    error,
  );
});

profileVideoAttachmentEnrichmentWorker.on("failed", async (job, error) => {
  console.error(
    "Worker обогащения видео-вложения профиля упал с ошибкой",
    getSafeJobLogContext(job),
    error,
  );

  const isFinalFailure = await isFinalJobFailure(job);

  if (!job || !isFinalFailure) {
    return;
  }

  console.error(
    "Обогащение summary и transcript для видео-вложения профиля окончательно не удалось",
    {
      profileVideoAttachmentId: job.data.profileVideoAttachmentId,
      jobId: job.id,
    },
  );
});

profileVideoAttachmentEnrichmentWorker.on("completed", (job) => {
  console.log(
    "Worker обогащения видео-вложения профиля отработал успешно",
    job.id,
  );
});
