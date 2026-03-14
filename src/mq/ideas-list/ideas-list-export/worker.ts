import { Worker } from "bullmq";
import { eq } from "drizzle-orm";

import { envs } from "@/constants/common/envs";
import { db } from "@/db";
import { attachment, exportDocument } from "@/db/schema";
import { redis } from "@/lib/redis";
import { createS3Key } from "@/lib/s3/utils/create-s3-key";
import { uploadBufferToS3 } from "@/lib/s3/utils/upload-buffer-to-s3";

import {
  IDEAS_LIST_EXPORT_QUEUE_NAME,
  type IdeasListExportJobData,
} from "./queue";
import { renderIdeasListExport } from "./utils";

export const ideasListExportWorker = new Worker<IdeasListExportJobData>(
  IDEAS_LIST_EXPORT_QUEUE_NAME,
  async (job) => {
    const { exportDocumentId, ideasListId, savedOnly } = job.data;

    console.log("Ideas list export worker started", job.data);

    try {
      const foundExportDocument = await db.query.exportDocument.findFirst({
        where: (document, { eq }) => eq(document.id, exportDocumentId),
        with: {
          format: true,
        },
      });

      if (!foundExportDocument) {
        throw new Error(
          `Ideas list export document not found: ${exportDocumentId}`,
        );
      }

      if (
        foundExportDocument.format.slug !== "pdf" &&
        foundExportDocument.format.slug !== "docx"
      ) {
        throw new Error(
          `Неподдерживаемый формат экспорта: ${foundExportDocument.format.slug}`,
        );
      }

      await db
        .update(exportDocument)
        .set({
          status: "generation",
          error: null,
        })
        .where(eq(exportDocument.id, exportDocumentId));

      const ideasListData = await db.query.ideasList.findFirst({
        where: (ideasList, { eq, and }) =>
          and(
            eq(ideasList.id, ideasListId),
            eq(ideasList.userId, foundExportDocument.userId),
          ),
        with: {
          ideas: {
            where: (idea, { eq }) =>
              savedOnly ? eq(idea.saved, true) : undefined,
            orderBy: (idea, { asc }) => [asc(idea.createdAt)],
            with: {
              videoType: true,
            },
          },
          template: true,
          profile: true,
          ideasListToTone: {
            with: {
              tone: true,
            },
          },
          ideasListToVideoType: {
            with: {
              videoType: true,
            },
          },
        },
      });

      if (!ideasListData) {
        throw new Error("Не удалось загрузить данные списка идей для экспорта");
      }

      const renderedExportFile = await renderIdeasListExport({
        format: foundExportDocument.format.slug,
        data: ideasListData,
        savedOnly,
      });

      const s3Key = createS3Key({
        userId: foundExportDocument.userId,
        folderName: "ideas-list-exports",
        fileName: `${exportDocumentId}-${renderedExportFile.fileName}`,
      });

      await uploadBufferToS3({
        key: s3Key,
        mimeType: renderedExportFile.mimeType,
        buffer: renderedExportFile.buffer,
      });

      const [createdAttachment] = await db
        .insert(attachment)
        .values({
          userId: foundExportDocument.userId,
          key: s3Key,
          bucketName: envs.S3_BUCKET_NAME,
          mimeType: renderedExportFile.mimeType,
        })
        .returning();

      await db
        .update(exportDocument)
        .set({
          attachmentId: createdAttachment.id,
          status: "ready",
          error: null,
        })
        .where(eq(exportDocument.id, exportDocumentId));

      console.log("Ideas list export generated", {
        exportDocumentId,
        attachmentId: createdAttachment.id,
      });
    } catch (error) {
      console.error(
        "Ideas list export generation worker error",
        exportDocumentId,
        error,
      );

      await db
        .update(exportDocument)
        .set({
          status: "failed",
          error:
            error instanceof Error ? error.message : "Unknown export error",
        })
        .where(eq(exportDocument.id, exportDocumentId));

      throw error;
    }
  },
  {
    concurrency: 5,
    connection: redis,
  },
);

ideasListExportWorker.on("error", (error) => {
  console.error("Ideas list export worker error", error);
});

ideasListExportWorker.on("failed", (job, error) => {
  console.error("Ideas list export worker failed", job?.toJSON(), error);
});

ideasListExportWorker.on("completed", (job) => {
  console.log("Ideas list export worker completed", job.id);
});
