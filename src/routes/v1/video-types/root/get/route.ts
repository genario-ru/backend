import { db } from "@/db";
import { createHonoApp } from "@/utils/create-hono-app";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { getVideoTypesResponseSchema, type GetVideoTypesResponse } from "@/schemas/entities/video-types/handlers/get-video-types/response";

export const videoTypesRoute = createHonoApp().basePath("/video-types");

// GET /api/v1/video-types
videoTypesRoute.get("/", sessionMiddleware, async (c) => {
  const foundVideoTypes = await db.query.videoType.findMany();

  return c.json<GetVideoTypesResponse>(getVideoTypesResponseSchema.parse({
    data: foundVideoTypes
  }));
});
