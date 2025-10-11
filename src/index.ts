import { serve } from "@hono/node-server";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from 'hono/request-id'
import { logger } from 'hono/logger'
import { showRoutes } from 'hono/dev'
import { authRoute } from "@/routes/auth/route";
import { createHonoApp } from "@/utils/create-hono-app";
import { videoDurationsRoute } from "./routes/v1/video-durations/root/get/route";
import { videoTypesRoute } from "./routes/v1/video-types/root/get/route";
import { addGracefulShutdown } from "./utils/add-graceful-shutdown";
import { errorHandlerMiddleware } from "./middleware/error-handler-middleware";
import { Scalar } from "@scalar/hono-api-reference";

const app = createHonoApp().basePath("/api");
const appV1Routes = createHonoApp().basePath("/v1");
const appV1RoutesList = [authRoute, videoDurationsRoute, videoTypesRoute];

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
app.get("/docs", Scalar({
  pageTitle: "API Documentation",
  sources: [
    { url: "/api/open-api", title: "API" },
    // Better Auth schema generation endpoint
    { url: "/api/auth/open-api/generate-schema", title: "Auth" },
  ],
}));

showRoutes(app, {
  verbose: true,
});

const server = serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

addGracefulShutdown(server)
