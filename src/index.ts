import { serve } from "@hono/node-server";
import { authRoute } from "@/routes/v1/auth/route";
import { createHonoApp } from "@/utils/create-hono-app";
import { videoDurationsRoute } from "./routes/v1/video-durations/route";
import { addGracefulShutdown } from "./utils/add-graceful-shutdown";
import { errorHandlerMiddleware } from "./middleware/error-handler-middleware";

const app = createHonoApp().basePath("/api");
const appV1Routes = createHonoApp().basePath("/v1");
const appV1RoutesList = [authRoute, videoDurationsRoute];

appV1RoutesList.forEach((route) => {
  appV1Routes.route("/", route);
});

app.use("*", errorHandlerMiddleware);
app.route("/", appV1Routes);

const server = serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

addGracefulShutdown(server)
