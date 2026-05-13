import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const SCENARIO_SCENE_PREVIEW_GENERATION_QUEUE_NAME =
  "scenario-scene-preview-generation";

const REMOVE_ON_COMPLETE = {
  age: 60 * 60,
  count: 10,
};

const REMOVE_ON_FAIL = {
  age: 60 * 60 * 24,
  count: 20,
};

export type ScenarioScenePreviewGenerationJobData = {
  scenarioScenePreviewId: string;
};

export const scenarioScenePreviewGenerationQueue =
  new Queue<ScenarioScenePreviewGenerationJobData>(
    SCENARIO_SCENE_PREVIEW_GENERATION_QUEUE_NAME,
    {
      connection: redis,
      defaultJobOptions: {
        attempts: 1,
        backoff: {
          type: "exponential",
          delay: 3000,
        },
        removeOnComplete: REMOVE_ON_COMPLETE,
        removeOnFail: REMOVE_ON_FAIL,
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
