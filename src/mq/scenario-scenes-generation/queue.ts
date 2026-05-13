import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const SCENARIO_SCENES_GENERATION_QUEUE_NAME =
  "scenario-scenes-generation";

const REMOVE_ON_COMPLETE = {
  age: 60 * 60,
  count: 10,
};

const REMOVE_ON_FAIL = {
  age: 60 * 60 * 24,
  count: 20,
};

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
        removeOnComplete: REMOVE_ON_COMPLETE,
        removeOnFail: REMOVE_ON_FAIL,
      },
    },
  );

export function enqueueScenarioScenesGeneration(
  data: ScenarioScenesGenerationJobData,
) {
  return scenarioScenesGenerationQueue.add("generate-scenario-scenes", data);
}
