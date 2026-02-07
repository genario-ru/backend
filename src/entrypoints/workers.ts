import { ideasGenerationWorker } from "@/mq/workers/ideas-generation-worker";

const shutdown = async () => {
  await ideasGenerationWorker.close();
  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
