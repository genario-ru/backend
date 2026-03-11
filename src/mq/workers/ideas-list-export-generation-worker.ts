import { Worker } from "bullmq";
import { eq } from "drizzle-orm";

import { envs } from "@/constants/common/envs";
import { db } from "@/db";
import { attachment, ideasListExport } from "@/db/schema";
import { redis } from "@/lib/redis";
import { createS3Key } from "@/lib/s3/utils/create-s3-key";
import { uploadBufferToS3 } from "@/lib/s3/utils/upload-buffer-to-s3";
import {
  loadIdeasListExportData,
  renderIdeasListExport,
} from "@/routes/v1/ideas-lists/ideas-list/exports/utils";

import {
  IDEAS_LIST_EXPORT_GENERATION_QUEUE_NAME,
  type IdeasListExportGenerationJobData,
} from "../queues/ideas-list-export-generation-queue";

export const ideasListExportGenerationWorker =
  new Worker<IdeasListExportGenerationJobData>(
    IDEAS_LIST_EXPORT_GENERATION_QUEUE_NAME,
    async (job) => {
      const { ideasListExportId } = job.data;

      console.log("Ideas list export generation worker started", job.data);

      try {
        const foundIdeasListExport = await db.query.ideasListExport.findFirst({
          where: (ideasListExport, { eq }) =>
            eq(ideasListExport.id, ideasListExportId),
        });

        if (!foundIdeasListExport) {
          console.warn(`Ideas list export not found: ${ideasListExportId}`);
          return;
        }

        await db
          .update(ideasListExport)
          .set({
            status: "generation",
            error: null,
          })
          .where(eq(ideasListExport.id, ideasListExportId));

        const ideasListData = await loadIdeasListExportData({
          ideasListId: foundIdeasListExport.ideasListId,
          userId: foundIdeasListExport.userId,
          savedOnly: foundIdeasListExport.savedOnly,
        });

        if (!ideasListData) {
          throw new Error(
            "Не удалось загрузить данные списка идей для экспорта",
          );
        }

        const renderedExportFile = await renderIdeasListExport({
          format: foundIdeasListExport.format,
          data: ideasListData,
          savedOnly: foundIdeasListExport.savedOnly,
        });

        const s3Key = createS3Key({
          userId: foundIdeasListExport.userId,
          folderName: "ideas-list-exports",
          fileName: `${ideasListExportId}-${renderedExportFile.fileName}`,
        });

        await uploadBufferToS3({
          key: s3Key,
          mimeType: renderedExportFile.mimeType,
          buffer: renderedExportFile.buffer,
        });

        const [createdAttachment] = await db
          .insert(attachment)
          .values({
            userId: foundIdeasListExport.userId,
            key: s3Key,
            bucketName: envs.S3_BUCKET_NAME,
            mimeType: renderedExportFile.mimeType,
          })
          .returning();

        await db
          .update(ideasListExport)
          .set({
            attachmentId: createdAttachment.id,
            status: "ready",
            error: null,
          })
          .where(eq(ideasListExport.id, ideasListExportId));

        console.log("Ideas list export generated", {
          ideasListExportId,
          attachmentId: createdAttachment.id,
        });
      } catch (error) {
        console.error(
          "Ideas list export generation worker error",
          ideasListExportId,
          error,
        );

        await db
          .update(ideasListExport)
          .set({
            status: "failed",
            error:
              error instanceof Error ? error.message : "Unknown export error",
          })
          .where(eq(ideasListExport.id, ideasListExportId));

        throw error;
      }
    },
    {
      concurrency: 5,
      connection: redis,
    },
  );

ideasListExportGenerationWorker.on("error", (error) => {
  console.error("Ideas list export generation worker error", error);
});

ideasListExportGenerationWorker.on("failed", (job, error) => {
  console.error(
    "Ideas list export generation worker failed",
    job?.toJSON(),
    error,
  );
});

ideasListExportGenerationWorker.on("completed", (job) => {
  console.log("Ideas list export generation worker completed", job.id);
});
