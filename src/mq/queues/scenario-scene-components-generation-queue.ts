import { Queue } from "bullmq";

import { redis } from "../../lib/redis";

export const SCENARIO_SCENE_COMPONENTS_GENERATION_QUEUE_NAME =
  "scenario-scene-components-generation";

export type ScenarioSceneComponentsGenerationJobData = {
  userId: string;
  scenarioVersionId: string;
  scenarioChapterId: string;
  scenarioSceneId: string;
};

export const scenarioSceneComponentsGenerationQueue =
  new Queue<ScenarioSceneComponentsGenerationJobData>(
    SCENARIO_SCENE_COMPONENTS_GENERATION_QUEUE_NAME,
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

export function enqueueScenarioSceneComponentsGeneration(
  data: ScenarioSceneComponentsGenerationJobData,
) {
  return scenarioSceneComponentsGenerationQueue.add(
    "generate-scenario-scene-components",
    data,
  );
}
