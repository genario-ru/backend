import { db } from "@/db";
import { createHonoApp } from "@/utils/create-hono-app";
import { sessionMiddleware } from "@/middleware/session-middleware";

export const videoDurationsRoute = createHonoApp().basePath("/video-durations");

videoDurationsRoute.use(sessionMiddleware);

// GET /api/v1/video-durations
videoDurationsRoute.get("/", async (c) => {
  const foundVideoDurations = await db.query.videoDuration.findMany();

  return c.json(foundVideoDurations);
});
