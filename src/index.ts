import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { openAPIRouteHandler } from "hono-openapi";

import { authRoute } from "@/routes/auth/route";
import { createHonoApp } from "@/utils/server/create-hono-app";

import { errorHandlerMiddleware } from "./middleware/error-handler-middleware";
import {
  getArchiveFiltersRoute,
  getMyArchiveItemsRoute,
} from "./routes/v1/archive";
import { deleteIdeaRoute, updateIdeaRoute } from "./routes/v1/ideas";
import {
  createIdeaRoute,
  createIdeasListRoute,
  deleteIdeasListRoute,
  getIdeasListRoute,
  getIdeasRoute,
  getMyIdeasListsRoute,
  updateIdeasListRoute,
} from "./routes/v1/ideas-lists";
import { getPlatformsRoute } from "./routes/v1/platforms";
import {
  createProfileRoute,
  deleteProfileRoute,
  getMyProfilesRoute,
  getProfileRoute,
  getProfileTypesRoute,
  updateProfileRoute,
} from "./routes/v1/profiles";
import {
  createScenarioRoute,
  deleteScenarioChapterRoute,
  deleteScenarioRoute,
  deleteScenarioSceneComponentRoute,
  deleteScenarioSceneRoute,
  deleteScenarioVersionRoute,
  getMyScenariosRoute,
  getScenarioChapterRoute,
  getScenarioRoute,
  getScenarioVersionRoute,
  getScenarioVersionsRoute,
  updateScenarioChapterRoute,
  updateScenarioCurrentVersionRoute,
  updateScenarioRoute,
  updateScenarioSceneComponentRoute,
  updateScenarioSceneRoute,
} from "./routes/v1/scenarios";
import { getTemplatesRoute } from "./routes/v1/templates";
import { getTonesRoute } from "./routes/v1/tones";
import { getVideoDurationsRoute } from "./routes/v1/video-durations";
import { getVideoTypesRoute } from "./routes/v1/video-types";

const app = createHonoApp();
const appAPI = app.basePath("/api");
const appAPIV1Routes = appAPI.basePath("/v1");

const appAPIv1RoutesList = [
  deleteIdeaRoute,
  updateIdeaRoute,
  createIdeasListRoute,
  deleteIdeasListRoute,
  getIdeasListRoute,
  getIdeasRoute,
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
  updateScenarioCurrentVersionRoute,
  updateScenarioRoute,
  deleteScenarioVersionRoute,
  getScenarioVersionRoute,
  getScenarioVersionsRoute,
  deleteScenarioChapterRoute,
  getScenarioChapterRoute,
  updateScenarioChapterRoute,
  deleteScenarioSceneRoute,
  updateScenarioSceneRoute,
  deleteScenarioSceneComponentRoute,
  updateScenarioSceneComponentRoute,
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
    origin: ["https://app.genario.ru", "http://localhost:5173"],
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

export default app;
