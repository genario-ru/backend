import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const SCENARIO_METADATA_REGENERATION_QUEUE_NAME =
  "scenario-metadata-regeneration";

export type ScenarioMetadataRegenerationJobData = {
  scenarioId: string;
  platformId: string;
  prompt?: string | null;
};

export const scenarioMetadataRegenerationQueue =
  new Queue<ScenarioMetadataRegenerationJobData>(
    SCENARIO_METADATA_REGENERATION_QUEUE_NAME,
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

export function enqueueScenarioMetadataRegeneration(
  data: ScenarioMetadataRegenerationJobData,
) {
  return scenarioMetadataRegenerationQueue.add(
    "regenerate-scenario-metadata",
    data,
  );
}
