import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const SCENARIO_CHAPTERS_GENERATION_QUEUE_NAME =
  "scenario-chapters-generation";

const REMOVE_ON_COMPLETE = {
  age: 60 * 60,
  count: 10,
};

const REMOVE_ON_FAIL = {
  age: 60 * 60 * 24,
  count: 20,
};

export type ScenarioChaptersGenerationJobData = {
  scenarioId: string;
  scenarioVersionId: string;
};

export const scenarioChaptersGenerationQueue =
  new Queue<ScenarioChaptersGenerationJobData>(
    SCENARIO_CHAPTERS_GENERATION_QUEUE_NAME,
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

export function enqueueScenarioChaptersGeneration(
  data: ScenarioChaptersGenerationJobData,
) {
  return scenarioChaptersGenerationQueue.add(
    "generate-scenario-chapters",
    data,
  );
}
