import { env } from "@/env";
import { initSentry, registerWorkerErrorHandlers } from "@/lib/sentry";
import { ideasListExportWorker } from "@/mq/ideas-list-export/worker";
import { ideasListGenerationWorker } from "@/mq/ideas-list-generation/worker";
import { mailSendWorker } from "@/mq/mail-send/worker";
import { profileAttachmentVideoProcessingWorker } from "@/mq/profile-attachment-video-processing/worker";
import { profileChannelVideoImportWorker } from "@/mq/profile-channel-video-import/worker";
import { profilesFromChannelsGenerationWorker } from "@/mq/profiles-from-channels-generation/worker";
import { scenarioChapterScenesGenerationWorker } from "@/mq/scenario-chapter-scenes-generation/worker";
import { scenarioChaptersGenerationWorker } from "@/mq/scenario-chapters-generation/worker";
import { scenarioMetadataGenerationWorker } from "@/mq/scenario-metadata-generation/worker";
import { scenarioMetadataRegenerationWorker } from "@/mq/scenario-metadata-regeneration/worker";
import { scenarioScenePreviewsGenerationWorker } from "@/mq/scenario-scene-preview-generation/worker";
import { scenarioScenesGenerationWorker } from "@/mq/scenario-scenes-generation/worker";
import { scenarioVersionExportWorker } from "@/mq/scenario-version-export/worker";
import {
  removeSubscriptionsChargeScheduler,
  upsertSubscriptionsChargeScheduler,
} from "@/mq/subscriptions-charge/queue";
import { subscriptionsChargeWorker } from "@/mq/subscriptions-charge/worker";
import {
  removeTerminateExpiredCreditsBatchesScheduler,
  upsertTerminateExpiredCreditsBatchesScheduler,
} from "@/mq/terminate-expired-credits-batches/queue";
import { terminateExpiredCreditsBatchesWorker } from "@/mq/terminate-expired-credits-batches/worker";
import {
  removeUpcomingChargesNewsletterScheduler,
  upsertUpcomingChargesNewsletterScheduler,
} from "@/mq/upcoming-charges-newsletter/queue";
import { upcomingChargesNewsletterWorker } from "@/mq/upcoming-charges-newsletter/worker";

initSentry({ runtime: "workers" });

registerWorkerErrorHandlers([
  ideasListGenerationWorker,
  ideasListExportWorker,
  profilesFromChannelsGenerationWorker,
  profileChannelVideoImportWorker,
  profileAttachmentVideoProcessingWorker,
  scenarioChaptersGenerationWorker,
  scenarioScenesGenerationWorker,
  scenarioChapterScenesGenerationWorker,
  scenarioScenePreviewsGenerationWorker,
  scenarioMetadataGenerationWorker,
  scenarioMetadataRegenerationWorker,
  scenarioVersionExportWorker,
  mailSendWorker,
  subscriptionsChargeWorker,
  terminateExpiredCreditsBatchesWorker,
  upcomingChargesNewsletterWorker,
]);

// Планируем автоматические джобы только если они включены через env.
// Если выключены — снимаем ранее созданные шедулеры из Redis, чтобы тоггл
// действительно останавливал ежечасный запуск.

if (env.SUBSCRIPTIONS_CHARGE_SCHEDULER_ENABLED) {
  await upsertSubscriptionsChargeScheduler();
} else {
  await removeSubscriptionsChargeScheduler();
}

if (env.UPCOMING_CHARGES_NEWSLETTER_SCHEDULER_ENABLED) {
  await upsertUpcomingChargesNewsletterScheduler();
} else {
  await removeUpcomingChargesNewsletterScheduler();
}

if (env.TERMINATE_EXPIRED_CREDITS_BATCHES_SCHEDULER_ENABLED) {
  await upsertTerminateExpiredCreditsBatchesScheduler();
} else {
  await removeTerminateExpiredCreditsBatchesScheduler();
}

const shutdown = async () => {
  await ideasListGenerationWorker.close();
  await ideasListExportWorker.close();
  await profilesFromChannelsGenerationWorker.close();
  await profileChannelVideoImportWorker.close();
  await profileAttachmentVideoProcessingWorker.close();
  await scenarioChaptersGenerationWorker.close();
  await scenarioScenesGenerationWorker.close();
  await scenarioChapterScenesGenerationWorker.close();
  await scenarioScenePreviewsGenerationWorker.close();
  await scenarioMetadataGenerationWorker.close();
  await scenarioMetadataRegenerationWorker.close();
  await scenarioVersionExportWorker.close();
  await mailSendWorker.close();
  await subscriptionsChargeWorker.close();
  await terminateExpiredCreditsBatchesWorker.close();
  await upcomingChargesNewsletterWorker.close();
  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
