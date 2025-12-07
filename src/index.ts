import { Scalar } from "@scalar/hono-api-reference";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";

import { authRoute } from "@/routes/auth/route";
import { createHonoApp } from "@/utils/create-hono-app";

import { errorHandlerMiddleware } from "./middleware/error-handler-middleware";
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
  updateIdeasListRoute,
  getPlatformsRoute,
  getMyProfilesRoute,
  deleteProfileRoute,
  getProfileRoute,
  updateProfileRoute,
  createProfileRoute,
  getProfileTypesRoute,
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

appAPI.route("/", authRoute);

appAPIv1RoutesList.forEach((route) => {
  appAPIV1Routes.route("/", route);
});

// Middleware
app.use(prettyJSON());
app.use(requestId());
app.use(logger());
app.use(errorHandlerMiddleware);

// Docs
app.get(
  "/api/docs",
  Scalar({
    pageTitle: "API Documentation",
    sources: [
      { url: "/api/open-api", title: "API" },
      // Better Auth schema generation endpoint
      { url: "/api/auth/open-api/generate-schema", title: "Auth API" },
    ],
  }),
);

export default app;
