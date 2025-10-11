import { db } from "@/db";
import { createHonoApp } from "@/utils/create-hono-app";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { getVideoDurationsResponseSchema, type GetVideoDurationsResponse } from "@/schemas/entities/video-durations/handlers/get-video-durations/response";

export const videoDurationsRoute = createHonoApp().basePath("/video-durations");

// GET /api/v1/video-durations
videoDurationsRoute.get("/", sessionMiddleware, async (c) => {
  const foundVideoDurations = await db.query.videoDuration.findMany();

  return c.json<GetVideoDurationsResponse>(getVideoDurationsResponseSchema.parse({
    data: foundVideoDurations
  }));
});
