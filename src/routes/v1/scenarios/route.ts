import { db } from "@/db";
import { createHonoApp } from "@/utils/create-hono-app";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { getVideoDurationsResponseSchema, type GetVideoDurationsResponse } from "@/schemas/entities/video-durations/get-video-durations/response";

export const videoDurationsRoute = createHonoApp().basePath("/scenarios");

videoDurationsRoute.use(sessionMiddleware);

// GET /api/v1/scenarios
videoDurationsRoute.get("/", async (c) => {
  const foundVideoDurations = await db.query.videoDuration.findMany();

  return c.json<GetVideoDurationsResponse>(getVideoDurationsResponseSchema.parse({
    data: foundVideoDurations
  }));
});
