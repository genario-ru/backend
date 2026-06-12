import { Queue } from "bullmq";

import { redis } from "@/lib/redis";

export const SCENARIO_CHAPTER_SCENES_GENERATION_QUEUE_NAME =
  "scenario-chapter-scenes-generation";

export type ScenarioChapterScenesGenerationJobData = {
  scenarioVersionId: string;
};

export const scenarioChapterScenesGenerationQueue =
  new Queue<ScenarioChapterScenesGenerationJobData>(
    SCENARIO_CHAPTER_SCENES_GENERATION_QUEUE_NAME,
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

export function enqueueScenarioChapterScenesGeneration(
  data: ScenarioChapterScenesGenerationJobData,
) {
  return scenarioChapterScenesGenerationQueue.add(
    "generate-scenario-chapter-scenes",
    data,
  );
}
