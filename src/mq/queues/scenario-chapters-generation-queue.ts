import { Queue } from "bullmq";

import { redis } from "../../lib/redis";

export const SCENARIO_CHAPTERS_GENERATION_QUEUE_NAME =
  "scenario-chapters-generation";

export type ScenarioChaptersGenerationJobData = {
  userId: string;
  scenarioVersionId: string;
  source: "create" | "update" | "manual";
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
        removeOnComplete: 100,
        removeOnFail: 100,
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
