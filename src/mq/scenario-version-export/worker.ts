import { Worker } from "bullmq";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { attachment, exportDocument } from "@/db/schema";
import { redis } from "@/lib/redis";
import { createS3Key } from "@/lib/s3/utils/create-s3-key";
import { uploadBufferToS3 } from "@/lib/s3/utils/upload-buffer-to-s3";
import { envs } from "@/shared/constants/common/envs";
import { SUPPORTED_EXPORT_FORMATS } from "@/shared/constants/common/supported-export-format";

import {
  SCENARIO_VERSION_EXPORT_QUEUE_NAME,
  type ScenarioVersionExportJobData,
} from "./queue";
import type { ScenarioVersionExportData } from "./types";
import { renderScenarioVersionExport } from "./utils";

export const scenarioVersionExportWorker =
  new Worker<ScenarioVersionExportJobData>(
    SCENARIO_VERSION_EXPORT_QUEUE_NAME,
    async (job) => {
      const { exportDocumentId, scenarioVersionId } = job.data;

      console.log("Scenario version export worker started", job.data);

      try {
        const foundScenarioVersionToExportDocument =
          await db.query.scenarioVersionToExportDocument.findFirst({
            where: (link, { eq, and }) =>
              and(
                eq(link.scenarioVersionId, scenarioVersionId),
                eq(link.exportDocumentId, exportDocumentId),
              ),
            with: {
              exportDocument: {
                with: {
                  format: true,
                },
              },
            },
          });

        if (!foundScenarioVersionToExportDocument) {
          throw new Error(
            `Scenario version export document not found: ${exportDocumentId}`,
          );
        }

        const { exportDocument: foundExportDocument } =
          foundScenarioVersionToExportDocument;

        if (
          !SUPPORTED_EXPORT_FORMATS.includes(foundExportDocument.format.slug)
        ) {
          throw new Error(
            `Неподдерживаемый формат документа: ${foundExportDocument.format.slug}`,
          );
        }

        await db
          .update(exportDocument)
          .set({
            status: "generation",
            statusDetails: null,
          })
          .where(eq(exportDocument.id, exportDocumentId));

        const foundScenarioVersion = await db.query.scenarioVersion.findFirst({
          where: (scenarioVersion, { eq }) =>
            eq(scenarioVersion.id, scenarioVersionId),
          with: {
            scenario: {
              with: {
                profile: true,
                platform: true,
                videoType: true,
                videoDuration: true,
                scenarioToTone: {
                  with: {
                    tone: true,
                  },
                },
              },
            },
            chapters: {
              orderBy: (scenarioChapter, { asc }) => [
                asc(scenarioChapter.startTime),
              ],
              with: {
                scenes: {
                  orderBy: (scenarioScene, { asc }) => [
                    asc(scenarioScene.startTime),
                  ],
                  with: {
                    components: {
                      orderBy: (scenarioSceneComponent, { asc }) => [
                        asc(scenarioSceneComponent.createdAt),
                      ],
                      with: {
                        type: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!foundScenarioVersion) {
          throw new Error(
            "Не удалось загрузить данные версии сценария для экспорта",
          );
        }

        if (
          foundScenarioVersion.scenario.userId !== foundExportDocument.userId
        ) {
          throw new Error(
            "Версия сценария не принадлежит владельцу экспортного документа",
          );
        }

        const {
          scenario: foundScenario,
          chapters,
          ...scenarioVersionData
        } = foundScenarioVersion;

        const { scenarioToTone, ...scenarioData } = foundScenario;

        const scenarioVersionExportData: ScenarioVersionExportData = {
          ...scenarioVersionData,
          scenario: {
            ...scenarioData,
            tones: scenarioToTone.map((item) => item.tone),
          },
          chapters,
        };

        const renderedExportFile = await renderScenarioVersionExport({
          format: foundExportDocument.format.slug,
          data: scenarioVersionExportData,
        });

        const s3Key = createS3Key({
          userId: foundExportDocument.userId,
          folderName: "scenario-version-exports",
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
            statusDetails: null,
          })
          .where(eq(exportDocument.id, exportDocumentId));

        console.log("Scenario version export generated", {
          exportDocumentId,
          attachmentId: createdAttachment.id,
        });
      } catch (error) {
        console.error(
          "Scenario version export generation worker error",
          exportDocumentId,
          error,
        );

        await db
          .update(exportDocument)
          .set({
            status: "failed",
            statusDetails:
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

scenarioVersionExportWorker.on("error", (error) => {
  console.error("Scenario version export worker error", error);
});

scenarioVersionExportWorker.on("failed", (job, error) => {
  console.error("Scenario version export worker failed", job?.toJSON(), error);
});

scenarioVersionExportWorker.on("completed", (job) => {
  console.log("Scenario version export worker completed", job.id);
});
