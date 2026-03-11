import { Queue } from "bullmq";

import { redis } from "../../lib/redis";

export const SCENARIO_VERSION_EXPORT_GENERATION_QUEUE_NAME =
  "scenario-version-export-generation";

export type ScenarioVersionExportGenerationJobData = {
  scenarioVersionExportId: string;
};

export const scenarioVersionExportGenerationQueue =
  new Queue<ScenarioVersionExportGenerationJobData>(
    SCENARIO_VERSION_EXPORT_GENERATION_QUEUE_NAME,
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

export function enqueueScenarioVersionExportGeneration(
  data: ScenarioVersionExportGenerationJobData,
) {
  return scenarioVersionExportGenerationQueue.add(
    "generate-scenario-version-export",
    data,
  );
}
