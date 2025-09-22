import { db } from "@/db";
import { createHonoApp } from "@/lib/create-hono-app";
import { sessionMiddleware } from "@/middleware/session-middleware";

export const videoDurationsRoutes = createHonoApp();

videoDurationsRoutes.use(sessionMiddleware);

// GET /v1/video-durations
videoDurationsRoutes.get("/v1/video-durations", async (c) => {
  const foundVideoDurations = await db.query.videoDuration.findMany();

  return c.json(foundVideoDurations);
});
