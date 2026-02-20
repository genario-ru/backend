import { generateImage } from "ai";
import { Worker } from "bullmq";

import { envs } from "@/constants/common/envs";
import { db } from "@/db";
import { vsellm } from "@/lib/ai/providers/vsellm";
import { redis } from "@/lib/redis";
import { generateScenarioPreviewPrompt } from "@/prompts/scenarios/generate-scenario-scene-preview-prompt";

import {
  SCENARIO_SCENE_PREVIEW_GENERATION_QUEUE_NAME,
  type ScenarioScenePreviewGenerationJobData,
} from "../queues/scenario-scene-preview-generation-queue";

export const scenarioScenePreviewsGenerationWorker =
  new Worker<ScenarioScenePreviewGenerationJobData>(
    SCENARIO_SCENE_PREVIEW_GENERATION_QUEUE_NAME,
    async (job) => {
      const { scenarioId, scenarioVersionId } = job.data;

      console.log("Scenario preview generation worker started", job.data);

      try {
        const foundScenario = await db.query.scenario.findFirst({
          where: (scenario, { eq }) => eq(scenario.id, scenarioId),
        });

        if (!foundScenario) {
          console.warn(`Scenario not found: ${scenarioId}`);

          return;
        }

        const prompt = generateScenarioPreviewPrompt({
          context: {
            scenarioName: foundScenario.name ?? "",
            scenarioDescription: foundScenario.description ?? "",
            scenarioTargetAudience: foundScenario.targetAudience ?? "",
          },
        });

        const { image, usage } = await generateImage({
          model: vsellm.imageModel(envs.VSELLM_IMAGE_MODEL),
          prompt,
          n: 1,
        });

        console.log("Scenario preview generated:", {
          scenarioId,
          scenarioVersionId,
          prompt,
          usage,
          imageBase64: image?.base64,
          mediaType: image?.mediaType,
        });
      } catch (error) {
        console.error(
          "Scenario preview generation worker error",
          scenarioId,
          error,
        );

        throw error;
      }
    },
    {
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
