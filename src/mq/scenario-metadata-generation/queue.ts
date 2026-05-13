import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const SCENARIO_METADATA_GENERATION_QUEUE_NAME =
  "scenario-metadata-generation";

export type ScenarioMetadataGenerationJobData = {
  scenarioId: string;
};

export const scenarioMetadataGenerationQueue =
  new Queue<ScenarioMetadataGenerationJobData>(
    SCENARIO_METADATA_GENERATION_QUEUE_NAME,
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

export function enqueueScenarioMetadataGeneration(
  data: ScenarioMetadataGenerationJobData,
) {
  return scenarioMetadataGenerationQueue.add(
    "generate-scenario-metadata",
    data,
  );
}
