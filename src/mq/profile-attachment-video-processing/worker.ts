import { join } from "node:path";

import { Worker } from "bullmq";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { attachment, profileAttachment } from "@/db/schema";
import { createUploadedAttachmentS3Key } from "@/lib/attachments/utils/create-uploaded-attachment-s3-key";
import { resolveInputFileExtension } from "@/lib/attachments/utils/resolve-input-file-extension";
import { toMp4FileName } from "@/lib/attachments/utils/to-mp4-file-name";
import { redis } from "@/lib/redis";
import { deleteS3Object } from "@/lib/s3/utils/delete-s3-object";
import { downloadS3ObjectToFile } from "@/lib/s3/utils/download-s3-object-to-file";
import { uploadFileToS3 } from "@/lib/s3/utils/upload-file-to-s3";
import { compressVideoFile } from "@/lib/video";
import { getSafeJobLogContext } from "@/shared/utils/mq/get-safe-job-log-context";
import { isFinalJobFailure } from "@/shared/utils/mq/is-final-job-failure";

import {
  PROFILE_ATTACHMENT_VIDEO_PROCESSING_QUEUE_NAME,
  type ProfileAttachmentVideoProcessingJobData,
} from "./queue";
import { cleanupJobTempDir, createJobTempDir } from "./utils";

const WORKER_LOCK_DURATION_MS = 35 * 60 * 1000;

export const profileAttachmentVideoProcessingWorker =
  new Worker<ProfileAttachmentVideoProcessingJobData>(
    PROFILE_ATTACHMENT_VIDEO_PROCESSING_QUEUE_NAME,
    async (job) => {
      const { profileAttachmentId } = job.data;

      console.log("Worker обработки видео profile attachment запущен", {
        profileAttachmentId,
        jobId: job.id,
      });

      const foundProfileAttachment = await db.query.profileAttachment.findFirst(
        {
          where: (item, { eq: eqFn }) => eqFn(item.id, profileAttachmentId),
          with: {
            attachment: true,
          },
        },
      );

      if (!foundProfileAttachment?.attachment) {
        throw new Error(
          `Profile attachment с id ${profileAttachmentId} не найден`,
        );
      }

      if (foundProfileAttachment.status === "ready") {
        console.log("Profile attachment уже обработан, пропускаем", {
          profileAttachmentId,
        });

        return;
      }

      const { attachment: foundAttachment } = foundProfileAttachment;
      const originalKey = foundAttachment.key;
      const originalBucketName = foundAttachment.bucketName;

      await db
        .update(profileAttachment)
        .set({
          status: "generation",
          statusDetails: null,
        })
        .where(eq(profileAttachment.id, profileAttachmentId));

      const tempDir = await createJobTempDir();

      try {
        const inputExtension = resolveInputFileExtension({
          fileName: foundAttachment.fileName,
        });

        const inputFilePath = join(tempDir, `input${inputExtension}`);
        const outputFilePath = join(tempDir, "output.mp4");

        await downloadS3ObjectToFile({
          bucketName: originalBucketName,
          key: originalKey,
          filePath: inputFilePath,
        });

        const { mimeType } = await compressVideoFile({
          inputFilePath,
          outputFilePath,
        });

        const optimizedFileName = toMp4FileName({
          fileName: foundAttachment.fileName,
        });
        const optimizedKey = createUploadedAttachmentS3Key({
          userId: foundAttachment.userId,
          attachmentId: foundAttachment.id,
          fileName: optimizedFileName,
        });

        await uploadFileToS3({
          key: optimizedKey,
          mimeType,
          filePath: outputFilePath,
        });

        if (optimizedKey !== originalKey) {
          await deleteS3Object({
            bucketName: originalBucketName,
            key: originalKey,
          });
        }

        await db
          .update(attachment)
          .set({
            key: optimizedKey,
            fileName: optimizedFileName,
            mimeType,
          })
          .where(eq(attachment.id, foundAttachment.id));

        await db
          .update(profileAttachment)
          .set({
            status: "ready",
            statusDetails: null,
          })
          .where(eq(profileAttachment.id, profileAttachmentId));

        console.log("Видео profile attachment успешно обработано", {
          profileAttachmentId,
          attachmentId: foundAttachment.id,
        });
      } finally {
        await cleanupJobTempDir({ tempDir });
      }
    },
    {
      concurrency: 1,
      connection: redis,
      lockDuration: WORKER_LOCK_DURATION_MS,
    },
  );

profileAttachmentVideoProcessingWorker.on("error", (error) => {
  console.error(
    "Worker обработки видео profile attachment упал с ошибкой",
    error,
  );
});

profileAttachmentVideoProcessingWorker.on("failed", async (job, error) => {
  console.error(
    "Worker обработки видео profile attachment завершился с ошибкой",
    getSafeJobLogContext(job),
    error,
  );

  const isFinalFailure = await isFinalJobFailure(job);

  if (!job || !isFinalFailure) {
    return;
  }

  const statusDetails =
    error instanceof Error
      ? error.message
      : "Неизвестная ошибка обработки видео";

  try {
    await db
      .update(profileAttachment)
      .set({
        status: "failed",
        statusDetails,
      })
      .where(eq(profileAttachment.id, job.data.profileAttachmentId));
  } catch (updateError) {
    console.error(
      "Не удалось обновить статус profile attachment после ошибки",
      updateError,
    );
  }
});
