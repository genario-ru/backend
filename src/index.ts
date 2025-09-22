import { serve } from "@hono/node-server";
import { authRoutes } from "@/routes/v1/auth/route";
import { createHonoApp } from "@/lib/create-hono-app";
import { videoDurationsRoutes } from "./routes/v1/video-durations/route";

const app = createHonoApp();
const routes = [authRoutes, videoDurationsRoutes] as const;

routes.forEach((route) => {
  app.basePath("/api").route("/", route);
});

// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// })

const server = serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

process.on('SIGINT', () => {
  server.close()
  process.exit(0)
})

process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    process.exit(0)
  })
})
