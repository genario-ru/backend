import { Queue } from "bullmq";

import { redis } from "../../lib/redis";

export const SCENARIO_SCENES_GENERATION_QUEUE_NAME =
  "scenario-scenes-generation";

export type ScenarioScenesGenerationJobData = {
  scenarioChapterId: string;
};

export const scenarioScenesGenerationQueue =
  new Queue<ScenarioScenesGenerationJobData>(
    SCENARIO_SCENES_GENERATION_QUEUE_NAME,
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

export function enqueueScenarioScenesGeneration(
  data: ScenarioScenesGenerationJobData,
) {
  return scenarioScenesGenerationQueue.add("generate-scenario-scenes", data);
}
