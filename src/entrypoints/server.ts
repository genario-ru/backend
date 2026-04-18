import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { HonoAdapter } from "@bull-board/hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { openAPIRouteHandler } from "hono-openapi";

import { errorHandlerMiddleware } from "@/middleware/error-handler-middleware";
import { ideasListExportQueue } from "@/mq/ideas-list-export/queue";
import { ideasListGenerationQueue } from "@/mq/ideas-list-generation/queue";
import { mailSendQueue } from "@/mq/mail-send/queue";
import { profilesFromChannelsGenerationQueue } from "@/mq/profiles-from-channels-generation/queue";
import { scenarioChaptersGenerationQueue } from "@/mq/scenario-chapters-generation/queue";
import { scenarioScenePreviewGenerationQueue } from "@/mq/scenario-scene-preview-generation/queue";
import { scenarioScenesGenerationQueue } from "@/mq/scenario-scenes-generation/queue";
import { scenarioVersionExportQueue } from "@/mq/scenario-version-export/queue";
import { authRoute } from "@/routes/api/auth/route";
import {
  getArchiveFiltersRoute,
  getMyArchiveItemsRoute,
} from "@/routes/api/v1/archive";
import { getAttachmentDownloadRoute } from "@/routes/api/v1/attachments";
import {
  addPaymentMethodRoute,
  deletePaymentMethodRoute,
  getMyPaymentMethodsRoute,
  getMyPaymentsRoute,
  processWebhookRoute,
} from "@/routes/api/v1/billing";
import {
  getCreditsPackagesRoute,
  getMyCreditsBatchesRoute,
  getMyCreditsUsageRoute,
  initiateCreditsPackagePaymentRoute,
} from "@/routes/api/v1/credits";
import {
  deleteIdeaRoute,
  getIdeaRoute,
  saveIdeaRoute,
  updateIdeaRoute,
} from "@/routes/api/v1/ideas";
import {
  createIdeaRoute,
  createIdeasListRoute,
  deleteIdeasListRoute,
  generateMoreIdeasRoute,
  getIdeasListExportRoute,
  getIdeasListExportsRoute,
  getIdeasListRoute,
  updateIdeasListRoute,
} from "@/routes/api/v1/ideas-lists";
import { getPlatformsRoute } from "@/routes/api/v1/platforms";
import { getProductionStatusesRoute } from "@/routes/api/v1/production-statuses";
import {
  createProfileRoute,
  createProfilesFromChannelsRoute,
  deleteProfileRoute,
  getMyProfilesFromChannelsJobs,
  getMyProfilesRoute,
  getPlatformsForChannelsRoute,
  getProfileRoute,
  getProfileTypesRoute,
  updateProfileRoute,
  validateProfileChannelRoute,
} from "@/routes/api/v1/profiles";
import {
  getMyReferralCodesRoute,
  getMyReferralInvitesRoute,
  getReferralInfoRoute,
} from "@/routes/api/v1/referral";
import {
  createScenarioExportRoute,
  createScenarioRoute,
  createScenarioScenePreviewRoute,
  deleteScenarioChapterRoute,
  deleteScenarioRoute,
  deleteScenarioSceneComponentRoute,
  deleteScenarioSceneRoute,
  getScenarioChapterRoute,
  getScenarioCurrentVersionRoute,
  getScenarioExportsRoute,
  getScenarioRoute,
  getScenarioVersionsRoute,
  saveScenarioRoute,
  updateScenarioChapterRoute,
  updateScenarioRoute,
  updateScenarioSceneComponentRoute,
  updateScenarioSceneRoute,
} from "@/routes/api/v1/scenarios";
import {
  cancelSubscriptionRoute,
  getMySubscriptionsRoute,
  initiateSubscriptionPaymentRoute,
} from "@/routes/api/v1/subscriptions";
import { getTariffsRoute, getTrialTariffRoute } from "@/routes/api/v1/tariffs";
import { getTemplatesRoute } from "@/routes/api/v1/templates";
import { getTonesRoute } from "@/routes/api/v1/tones";
import { getVideoDurationsRoute } from "@/routes/api/v1/video-durations";
import { getVideoTypesRoute } from "@/routes/api/v1/video-types";
import { healthRoute } from "@/routes/health";
import { rootRoute } from "@/routes/root";
import { TRUSTED_ORIGINS } from "@/shared/constants/api/trusted-origins";
import { envs } from "@/shared/constants/common/envs";
import { addGracefulShutdown } from "@/shared/utils/server/add-graceful-shutdown";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

const app = createHonoApp();
const appAPI = app.basePath("/api");
const appAPIV1Routes = appAPI.basePath("/v1");

const bullBoardAdapter = new HonoAdapter(serveStatic);
const bullBoardBasePath = "/admin/queues";

createBullBoard({
  queues: [
    new BullMQAdapter(ideasListGenerationQueue),
    new BullMQAdapter(ideasListExportQueue),
    new BullMQAdapter(profilesFromChannelsGenerationQueue),
    new BullMQAdapter(scenarioChaptersGenerationQueue),
    new BullMQAdapter(scenarioScenesGenerationQueue),
    new BullMQAdapter(scenarioScenePreviewGenerationQueue),
    new BullMQAdapter(scenarioVersionExportQueue),
    new BullMQAdapter(mailSendQueue),
  ],
  serverAdapter: bullBoardAdapter,
});

bullBoardAdapter.setBasePath(bullBoardBasePath);
app.route(bullBoardBasePath, bullBoardAdapter.registerPlugin());

const appAPIv1RoutesList = [
  deleteIdeaRoute,
  getIdeaRoute,
  updateIdeaRoute,
  saveIdeaRoute,
  getProductionStatusesRoute,
  getAttachmentDownloadRoute,
  addPaymentMethodRoute,
  deletePaymentMethodRoute,
  getMyPaymentMethodsRoute,
  getMyPaymentsRoute,
  processWebhookRoute,
  getCreditsPackagesRoute,
  getMyCreditsBatchesRoute,
  getMyCreditsUsageRoute,
  initiateCreditsPackagePaymentRoute,
  createIdeasListRoute,
  deleteIdeasListRoute,
  generateMoreIdeasRoute,
  getIdeasListExportRoute,
  getIdeasListExportsRoute,
  getIdeasListRoute,
  createIdeaRoute,
  getMyArchiveItemsRoute,
  getArchiveFiltersRoute,
  updateIdeasListRoute,
  getPlatformsRoute,
  getMyProfilesFromChannelsJobs,
  getMyProfilesRoute,
  createProfilesFromChannelsRoute,
  validateProfileChannelRoute,
  getPlatformsForChannelsRoute,
  deleteProfileRoute,
  getProfileTypesRoute,
  getProfileRoute,
  updateProfileRoute,
  createProfileRoute,
  getMyReferralCodesRoute,
  getMyReferralInvitesRoute,
  getReferralInfoRoute,
  createScenarioRoute,
  deleteScenarioRoute,
  getScenarioRoute,
  getScenarioCurrentVersionRoute,
  updateScenarioRoute,
  saveScenarioRoute,
  getScenarioVersionsRoute,
  deleteScenarioChapterRoute,
  getScenarioChapterRoute,
  updateScenarioChapterRoute,
  createScenarioScenePreviewRoute,
  deleteScenarioSceneRoute,
  updateScenarioSceneRoute,
  deleteScenarioSceneComponentRoute,
  updateScenarioSceneComponentRoute,
  createScenarioExportRoute,
  getScenarioExportsRoute,
  getMySubscriptionsRoute,
  cancelSubscriptionRoute,
  initiateSubscriptionPaymentRoute,
  getTariffsRoute,
  getTrialTariffRoute,
  getTemplatesRoute,
  getTonesRoute,
  getVideoDurationsRoute,
  getVideoTypesRoute,
];

// Middleware
app.use(prettyJSON());
app.use(requestId());
app.use(logger());

app.use(
  cors({
    origin: TRUSTED_ORIGINS,
    maxAge: 600,
    credentials: true,
  }),
);

app.use(errorHandlerMiddleware);

app.route("/", rootRoute);
app.route("/", healthRoute);

appAPI.route("/", authRoute);

appAPIv1RoutesList.forEach((route) => {
  appAPIV1Routes.route("/", route);
});

// OpenAPI
app.get(
  "/api/open-api",
  openAPIRouteHandler(appAPI, {
    documentation: {
      info: {
        title: "Genario API",
        version: "1.0.0",
        description: "API for Genario application",
      },
      servers: [
        {
          url: envs.BACKEND_BASE_URL,
        },
      ],
    },
  }),
);

// Docs
app.get(
  "/api/docs",
  Scalar({
    pageTitle: "API Documentation",
    sources: [
      { url: "/api/open-api", title: "Product API" },
      { url: "/api/auth/open-api/generate-schema", title: "Auth API" },
    ],
  }),
);

showRoutes(app, {
  verbose: true,
});

const server = serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

addGracefulShutdown(server);
