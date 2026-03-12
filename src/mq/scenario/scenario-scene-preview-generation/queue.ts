import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const SCENARIO_SCENE_PREVIEW_GENERATION_QUEUE_NAME =
  "scenario-scene-preview-generation";

export type ScenarioScenePreviewGenerationJobData = {
  scenarioScenePreviewId: string;
};

export const scenarioScenePreviewGenerationQueue =
  new Queue<ScenarioScenePreviewGenerationJobData>(
    SCENARIO_SCENE_PREVIEW_GENERATION_QUEUE_NAME,
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

export function enqueueScenarioScenePreviewGeneration(
  data: ScenarioScenePreviewGenerationJobData,
) {
  return scenarioScenePreviewGenerationQueue.add(
    "generate-scenario-scene-preview",
    data,
  );
}
