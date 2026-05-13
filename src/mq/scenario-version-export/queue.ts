import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const SCENARIO_VERSION_EXPORT_QUEUE_NAME = "scenario-version-export";

const REMOVE_ON_COMPLETE = {
  age: 60 * 60,
  count: 10,
};

const REMOVE_ON_FAIL = {
  age: 60 * 60 * 24,
  count: 20,
};

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
      removeOnComplete: REMOVE_ON_COMPLETE,
      removeOnFail: REMOVE_ON_FAIL,
    },
  });

export function enqueueScenarioVersionExport(
  data: ScenarioVersionExportJobData,
) {
  return scenarioVersionExportQueue.add("export-scenario-version", data);
}
