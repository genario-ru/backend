import { db } from "@/db";
import { sessionMiddleware } from "@/middleware/session-middleware";
import {
  type GetVideoTypesResponse,
  getVideoTypesResponseSchema,
} from "@/schemas/entities/video-types/handlers/get-video-types/response";
import { createHonoApp } from "@/utils/create-hono-app";

export const videoTypesRoute = createHonoApp().basePath("/video-types");

// GET /api/v1/video-types
videoTypesRoute.get("/", sessionMiddleware, async (c) => {
  const foundVideoTypes = await db.query.videoType.findMany();

  return c.json<GetVideoTypesResponse>(
    getVideoTypesResponseSchema.parse({
      data: foundVideoTypes,
    }),
  );
});
