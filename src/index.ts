import { Scalar } from "@scalar/hono-api-reference";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";

import { authRoute } from "@/routes/auth/route";
import { createHonoApp } from "@/utils/create-hono-app";

import { errorHandlerMiddleware } from "./middleware/error-handler-middleware";
import { deleteIdeaRoute, updateIdeaRoute } from "./routes/v1/ideas";
import {
  createIdeasListRoute,
  deleteIdeasListRoute,
  getIdeasListRoute,
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
import { getMyScenariosRoute } from "./routes/v1/scenarios";
import { getTemplatesRoute } from "./routes/v1/templates";
import { getTonesRoute } from "./routes/v1/tones";
import { getVideoDurationsRoute } from "./routes/v1/video-durations";
import { getVideoTypesRoute } from "./routes/v1/video-types";

const app = createHonoApp().basePath("/api");
const appV1Routes = createHonoApp().basePath("/v1");
const appV1RoutesList = [
  authRoute,
  deleteIdeaRoute,
  updateIdeaRoute,
  createIdeasListRoute,
  deleteIdeasListRoute,
  getIdeasListRoute,
  getMyIdeasListsRoute,
  updateIdeasListRoute,
  getPlatformsRoute,
  getMyProfilesRoute,
  deleteProfileRoute,
  getProfileRoute,
  updateProfileRoute,
  createProfileRoute,
  getProfileTypesRoute,
  getMyScenariosRoute,
  getTemplatesRoute,
  getTonesRoute,
  getVideoDurationsRoute,
  getVideoTypesRoute,
];

app.route("/", authRoute);

appV1RoutesList.forEach((route) => {
  appV1Routes.route("/", route);
});

// Middleware
app.use(prettyJSON());
app.use(requestId());
app.use(logger());
app.use(errorHandlerMiddleware);

// Routes
app.route("/", appV1Routes);

// Docs
app.get(
  "/docs",
  Scalar({
    pageTitle: "API Documentation",
    sources: [
      { url: "/api/open-api", title: "API" },
      // Better Auth schema generation endpoint
      { url: "/api/auth/open-api/generate-schema", title: "Auth" },
    ],
  }),
);

export default app;
