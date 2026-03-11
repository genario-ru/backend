import { Worker } from "bullmq";
import { eq } from "drizzle-orm";

import { envs } from "@/constants/common/envs";
import { db } from "@/db";
import { attachment, scenarioVersionExport } from "@/db/schema";
import { redis } from "@/lib/redis";
import { createS3Key } from "@/lib/s3/utils/create-s3-key";
import { uploadBufferToS3 } from "@/lib/s3/utils/upload-buffer-to-s3";
import {
  loadScenarioVersionExportData,
  renderScenarioVersionExport,
} from "@/routes/v1/scenarios/versions/version/exports/utils";

import {
  SCENARIO_VERSION_EXPORT_GENERATION_QUEUE_NAME,
  type ScenarioVersionExportGenerationJobData,
} from "../queues/scenario-version-export-generation-queue";

export const scenarioVersionExportGenerationWorker =
  new Worker<ScenarioVersionExportGenerationJobData>(
    SCENARIO_VERSION_EXPORT_GENERATION_QUEUE_NAME,
    async (job) => {
      const { scenarioVersionExportId } = job.data;

      console.log(
        "Scenario version export generation worker started",
        job.data,
      );

      try {
        const foundScenarioVersionExport =
          await db.query.scenarioVersionExport.findFirst({
            where: (scenarioVersionExport, { eq }) =>
              eq(scenarioVersionExport.id, scenarioVersionExportId),
          });

        if (!foundScenarioVersionExport) {
          console.warn(
            `Scenario version export not found: ${scenarioVersionExportId}`,
          );
          return;
        }

        await db
          .update(scenarioVersionExport)
          .set({
            status: "generation",
            error: null,
          })
          .where(eq(scenarioVersionExport.id, scenarioVersionExportId));

        const scenarioVersionData = await loadScenarioVersionExportData({
          versionId: foundScenarioVersionExport.scenarioVersionId,
          userId: foundScenarioVersionExport.userId,
        });

        if (!scenarioVersionData) {
          throw new Error(
            "Не удалось загрузить данные версии сценария для экспорта",
          );
        }

        const renderedExportFile = await renderScenarioVersionExport({
          format: foundScenarioVersionExport.format,
          data: scenarioVersionData,
        });

        const s3Key = createS3Key({
          userId: foundScenarioVersionExport.userId,
          folderName: "scenario-version-exports",
          fileName: `${scenarioVersionExportId}-${renderedExportFile.fileName}`,
        });

        await uploadBufferToS3({
          key: s3Key,
          mimeType: renderedExportFile.mimeType,
          buffer: renderedExportFile.buffer,
        });

        const [createdAttachment] = await db
          .insert(attachment)
          .values({
            userId: foundScenarioVersionExport.userId,
            key: s3Key,
            bucketName: envs.S3_BUCKET_NAME,
            mimeType: renderedExportFile.mimeType,
          })
          .returning();

        await db
          .update(scenarioVersionExport)
          .set({
            attachmentId: createdAttachment.id,
            status: "ready",
            error: null,
          })
          .where(eq(scenarioVersionExport.id, scenarioVersionExportId));

        console.log("Scenario version export generated", {
          scenarioVersionExportId,
          attachmentId: createdAttachment.id,
        });
      } catch (error) {
        console.error(
          "Scenario version export generation worker error",
          scenarioVersionExportId,
          error,
        );

        await db
          .update(scenarioVersionExport)
          .set({
            status: "failed",
            error:
              error instanceof Error ? error.message : "Unknown export error",
          })
          .where(eq(scenarioVersionExport.id, scenarioVersionExportId));

        throw error;
      }
    },
    {
      concurrency: 5,
      connection: redis,
    },
  );

scenarioVersionExportGenerationWorker.on("error", (error) => {
  console.error("Scenario version export generation worker error", error);
});

scenarioVersionExportGenerationWorker.on("failed", (job, error) => {
  console.error(
    "Scenario version export generation worker failed",
    job?.toJSON(),
    error,
  );
});

scenarioVersionExportGenerationWorker.on("completed", (job) => {
  console.log("Scenario version export generation worker completed", job.id);
});
