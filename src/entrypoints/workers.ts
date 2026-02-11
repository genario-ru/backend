import { ideasListGenerationWorker } from "@/mq/workers/ideas-list-generation-worker";
import { scenarioChaptersGenerationWorker } from "@/mq/workers/scenario-chapters-generation-worker";
import { scenarioSceneComponentsGenerationWorker } from "@/mq/workers/scenario-scene-components-generation-worker";
import { scenarioScenesGenerationWorker } from "@/mq/workers/scenario-scenes-generation-worker";

const shutdown = async () => {
  await ideasListGenerationWorker.close();
  await scenarioChaptersGenerationWorker.close();
  await scenarioScenesGenerationWorker.close();
  await scenarioSceneComponentsGenerationWorker.close();
  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
