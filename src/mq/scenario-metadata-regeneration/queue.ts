import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const SCENARIO_METADATA_REGENERATION_QUEUE_NAME =
  "scenario-metadata-regeneration";

const REMOVE_ON_COMPLETE = {
  age: 60 * 60,
  count: 10,
};

const REMOVE_ON_FAIL = {
  age: 60 * 60 * 24,
  count: 20,
};

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
        removeOnComplete: REMOVE_ON_COMPLETE,
        removeOnFail: REMOVE_ON_FAIL,
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
