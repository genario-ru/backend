import { generateImage } from "ai";
import { Worker } from "bullmq";
import { eq } from "drizzle-orm";

import { generateScenarioScenePreviewPrompt } from "@/ai/prompts/scenarios/generate-scenario-scene-preview-prompt";
import { vsellm } from "@/ai/providers/vsellm";
import { envs } from "@/constants/common/envs";
import { db } from "@/db";
import { attachment, generationLog, scenarioScenePreview } from "@/db/schema";
import { compressBase64Image } from "@/lib/image/utils/compress-base64-image";
import { redis } from "@/lib/redis";
import { createS3Key } from "@/lib/s3/utils/create-s3-key";
import { uploadBase64ToS3 } from "@/lib/s3/utils/upload-base-64-to-s3";
import { uploadBufferToS3 } from "@/lib/s3/utils/upload-buffer-to-s3";

import {
  SCENARIO_SCENE_PREVIEW_GENERATION_QUEUE_NAME,
  type ScenarioScenePreviewGenerationJobData,
} from "./queue";

export const scenarioScenePreviewsGenerationWorker =
  new Worker<ScenarioScenePreviewGenerationJobData>(
    SCENARIO_SCENE_PREVIEW_GENERATION_QUEUE_NAME,
    async (job) => {
      const { scenarioScenePreviewId } = job.data;

      console.log("Scenario scene preview generation worker started", job.data);

      try {
        const foundPreview = await db.query.scenarioScenePreview.findFirst({
          where: (preview, { eq }) => eq(preview.id, scenarioScenePreviewId),
          with: {
            scenarioScene: {
              with: {
                scenarioChapter: {
                  with: {
                    scenarioVersion: true,
                  },
                },
              },
            },
          },
        });

        if (!foundPreview) {
          console.warn(
            `Scenario scene preview not found: ${scenarioScenePreviewId}`,
          );

          return;
        }

        const scene = foundPreview.scenarioScene;
        const scenarioId = scene.scenarioChapter.scenarioVersion.scenarioId;

        const scenario = await db.query.scenario.findFirst({
          where: (scenario, { eq }) => eq(scenario.id, scenarioId),
        });

        if (!scenario) {
          console.warn(`Scenario not found: ${scenarioId}`);

          return;
        }

        await db
          .update(scenarioScenePreview)
          .set({ status: "generation" })
          .where(eq(scenarioScenePreview.id, scenarioScenePreviewId));

        const prompt = generateScenarioScenePreviewPrompt({
          scenarioName: scenario.name,
          scenarioDescription: scenario.description,
          scenarioTargetAudience: scenario.targetAudience,
          chapterName: scene.scenarioChapter.name,
          chapterDescription: scene.scenarioChapter.description,
          sceneName: scene.name,
          sceneStartTime: scene.startTime,
          sceneEndTime: scene.endTime,
        });

        const { image, usage } = await generateImage({
          model: vsellm.imageModel(envs.VSELLM_IMAGE_MODEL),
          prompt,
          n: 1,
        });

        const s3KeyOriginal = createS3Key({
          userId: scenario.userId,
          folderName: "scenario-scene-previews",
          fileName: `${scenarioScenePreviewId}.png`,
        });

        const s3KeyCompressed = createS3Key({
          userId: scenario.userId,
          folderName: "scenario-scene-previews",
          fileName: `${scenarioScenePreviewId}-compressed.webp`,
        });

        await uploadBase64ToS3({
          key: s3KeyOriginal,
          mimeType: image.mediaType,
          base64: image.base64,
        });

        const { buffer: compressedBuffer, mimeType: compressedMimeType } =
          await compressBase64Image(image.base64);

        await uploadBufferToS3({
          key: s3KeyCompressed,
          mimeType: compressedMimeType,
          buffer: compressedBuffer,
        });

        const { createdAttachment, createdCompressedAttachment } =
          await db.transaction(async (tx) => {
            const [[createdAttachment], [createdCompressedAttachment]] =
              await Promise.all([
                tx
                  .insert(attachment)
                  .values({
                    userId: scenario.userId,
                    key: s3KeyOriginal,
                    bucketName: envs.S3_BUCKET_NAME,
                    mimeType: image.mediaType,
                  })
                  .returning(),
                tx
                  .insert(attachment)
                  .values({
                    userId: scenario.userId,
                    key: s3KeyCompressed,
                    bucketName: envs.S3_BUCKET_NAME,
                    mimeType: compressedMimeType,
                  })
                  .returning(),
              ]);

            await Promise.all([
              tx
                .update(scenarioScenePreview)
                .set({
                  attachmentId: createdAttachment.id,
                  compressedAttachmentId: createdCompressedAttachment.id,
                  status: "ready",
                })
                .where(eq(scenarioScenePreview.id, scenarioScenePreviewId)),
              tx.insert(generationLog).values({
                entity: "scenario-scene-preview" as const,
                entityId: scenarioScenePreviewId,
                prompt,
                model: envs.POLZA_AI_IMAGE_MODEL,
                tokens: usage?.totalTokens ?? 0,
              }),
            ]);

            return {
              createdAttachment,
              createdCompressedAttachment,
            };
          });

        console.log("Scenario scene preview generated:", {
          scenarioScenePreviewId,
          attachmentId: createdAttachment.id,
          compressedAttachmentId: createdCompressedAttachment.id,
        });
      } catch (error) {
        console.error(
          "Scenario scene preview generation worker error",
          scenarioScenePreviewId,
          error,
        );

        try {
          await db
            .update(scenarioScenePreview)
            .set({ status: "failed" })
            .where(eq(scenarioScenePreview.id, scenarioScenePreviewId));
        } catch (updateError) {
          console.error(
            "Scenario scene preview generation worker failed to update status",
            updateError,
          );
        }

        throw error;
      }
    },
    {
      concurrency: 5,
      connection: redis,
    },
  );

scenarioScenePreviewsGenerationWorker.on("error", (error) => {
  console.error("Scenario scene preview generation worker error", error);
});

scenarioScenePreviewsGenerationWorker.on("failed", (job, error) => {
  console.error(
    "Scenario scene preview generation worker failed",
    job?.toJSON(),
    error,
  );
});

scenarioScenePreviewsGenerationWorker.on("completed", (job) => {
  console.log("Scenario scene preview generation worker completed", job.id);
});
