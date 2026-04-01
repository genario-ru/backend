import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const SCENARIO_VERSION_EXPORT_QUEUE_NAME = "scenario-version-export";

export type ScenarioVersionExportJobData = {
  exportDocumentId: string;
  scenarioVersionId: string;
};

export const scenarioVersionExportQueue =
  new Queue<ScenarioVersionExportJobData>(SCENARIO_VERSION_EXPORT_QUEUE_NAME, {
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
  });

export function enqueueScenarioVersionExport(
  data: ScenarioVersionExportJobData,
) {
  return scenarioVersionExportQueue.add("export-scenario-version", data);
}
