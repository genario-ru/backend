import { serve } from "@hono/node-server";
import { showRoutes } from "hono/dev";

import app from ".";
import { addGracefulShutdown } from "./utils/server/add-graceful-shutdown";

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
