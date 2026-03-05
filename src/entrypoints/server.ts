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

import { TRUSTED_ORIGINS } from "@/constants/api/trusted-origins";
import { errorHandlerMiddleware } from "@/middleware/error-handler-middleware";
import { ideasListGenerationQueue } from "@/mq/queues/ideas-list-generation-queue";
import { scenarioChaptersGenerationQueue } from "@/mq/queues/scenario-chapters-generation-queue";
import { scenarioScenePreviewGenerationQueue } from "@/mq/queues/scenario-scene-preview-generation-queue";
import { scenarioScenesGenerationQueue } from "@/mq/queues/scenario-scenes-generation-queue";
import { authRoute } from "@/routes/auth/route";
import {
  getArchiveFiltersRoute,
  getMyArchiveItemsRoute,
} from "@/routes/v1/archive";
import {
  deleteIdeaRoute,
  getIdeaRoute,
  saveIdeaRoute,
  updateIdeaRoute,
} from "@/routes/v1/ideas";
import {
  createIdeaRoute,
  createIdeasListRoute,
  deleteIdeasListRoute,
  generateMoreIdeasRoute,
  getIdeasListRoute,
  getMyIdeasListsRoute,
  updateIdeasListRoute,
} from "@/routes/v1/ideas-lists";
import { getPlatformsRoute } from "@/routes/v1/platforms";
import {
  createProfileRoute,
  deleteProfileRoute,
  getMyProfilesRoute,
  getProfileRoute,
  getProfileTypesRoute,
  updateProfileRoute,
} from "@/routes/v1/profiles";
import {
  getMyReferralCodesRoute,
  getMyReferralInvitesRoute,
  getReferralInfoRoute,
} from "@/routes/v1/referral";
import {
  createScenarioRoute,
  createScenarioScenePreviewRoute,
  deleteScenarioChapterRoute,
  deleteScenarioRoute,
  deleteScenarioSceneComponentRoute,
  deleteScenarioSceneRoute,
  deleteScenarioVersionRoute,
  getMyScenariosRoute,
  getScenarioChapterRoute,
  getScenarioCurrentVersionRoute,
  getScenarioRoute,
  getScenarioVersionRoute,
  getScenarioVersionsRoute,
  saveScenarioRoute,
  updateScenarioChapterRoute,
  updateScenarioCurrentVersionRoute,
  updateScenarioRoute,
  updateScenarioSceneComponentRoute,
  updateScenarioSceneRoute,
} from "@/routes/v1/scenarios";
import { getTariffsRoute, getTrialTariffRoute } from "@/routes/v1/tariffs";
import { getTemplatesRoute } from "@/routes/v1/templates";
import { getTonesRoute } from "@/routes/v1/tones";
import { getVideoDurationsRoute } from "@/routes/v1/video-durations";
import { getVideoTypesRoute } from "@/routes/v1/video-types";
import { addGracefulShutdown } from "@/utils/server/add-graceful-shutdown";
import { createHonoApp } from "@/utils/server/create-hono-app";

const app = createHonoApp();
const appAPI = app.basePath("/api");
const appAPIV1Routes = appAPI.basePath("/v1");

const bullBoardAdapter = new HonoAdapter(serveStatic);
const bullBoardBasePath = "/admin/queues";

createBullBoard({
  queues: [
    new BullMQAdapter(ideasListGenerationQueue),
    new BullMQAdapter(scenarioChaptersGenerationQueue),
    new BullMQAdapter(scenarioScenesGenerationQueue),
    new BullMQAdapter(scenarioScenePreviewGenerationQueue),
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
  createIdeasListRoute,
  deleteIdeasListRoute,
  generateMoreIdeasRoute,
  getIdeasListRoute,
  createIdeaRoute,
  getMyIdeasListsRoute,
  getMyArchiveItemsRoute,
  getArchiveFiltersRoute,
  updateIdeasListRoute,
  getPlatformsRoute,
  getMyProfilesRoute,
  deleteProfileRoute,
  getProfileTypesRoute,
  getProfileRoute,
  updateProfileRoute,
  createProfileRoute,
  createScenarioRoute,
  deleteScenarioRoute,
  getMyScenariosRoute,
  getScenarioRoute,
  getScenarioCurrentVersionRoute,
  updateScenarioCurrentVersionRoute,
  updateScenarioRoute,
  saveScenarioRoute,
  deleteScenarioVersionRoute,
  getScenarioVersionRoute,
  getScenarioVersionsRoute,
  deleteScenarioChapterRoute,
  getScenarioChapterRoute,
  updateScenarioChapterRoute,
  createScenarioScenePreviewRoute,
  deleteScenarioSceneRoute,
  updateScenarioSceneRoute,
  deleteScenarioSceneComponentRoute,
  updateScenarioSceneComponentRoute,
  getMyReferralCodesRoute,
  getMyReferralInvitesRoute,
  getReferralInfoRoute,
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
          url: "https://api.genario.ru",
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
