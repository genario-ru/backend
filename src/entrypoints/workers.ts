import { ideasListExportWorker } from "@/mq/ideas-list-export/worker";
import { ideasListGenerationWorker } from "@/mq/ideas-list-generation/worker";
import { profilesFromChannelsGenerationWorker } from "@/mq/profiles-from-channels-generation/worker";
import { scenarioChaptersGenerationWorker } from "@/mq/scenario-chapters-generation/worker";
import { scenarioScenePreviewsGenerationWorker } from "@/mq/scenario-scene-preview-generation/worker";
import { scenarioScenesGenerationWorker } from "@/mq/scenario-scenes-generation/worker";
import { scenarioVersionExportWorker } from "@/mq/scenario-version-export/worker";

const shutdown = async () => {
  await ideasListGenerationWorker.close();
  await ideasListExportWorker.close();
  await profilesFromChannelsGenerationWorker.close();
  await scenarioChaptersGenerationWorker.close();
  await scenarioScenesGenerationWorker.close();
  await scenarioScenePreviewsGenerationWorker.close();
  await scenarioVersionExportWorker.close();
  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
