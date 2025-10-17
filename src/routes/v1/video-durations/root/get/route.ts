import { db } from "@/db";
import { sessionMiddleware } from "@/middleware/session-middleware";
import {
  type GetVideoDurationsResponse,
  getVideoDurationsResponseSchema,
} from "@/schemas/entities/video-durations/handlers/get-video-durations/response";
import { createHonoApp } from "@/utils/create-hono-app";

export const getVideoDurationsRoute =
  createHonoApp().basePath("/video-durations");

// GET /api/v1/video-durations
getVideoDurationsRoute.get("/", sessionMiddleware, async (c) => {
  const foundVideoDurations = await db.query.videoDuration.findMany();

  return c.json<GetVideoDurationsResponse>(
    getVideoDurationsResponseSchema.parse({
      data: foundVideoDurations,
    }),
  );
});
