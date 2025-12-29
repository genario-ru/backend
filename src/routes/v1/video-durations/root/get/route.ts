import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import {
  type GetVideoDurationsResponse,
  getVideoDurationsResponseSchema,
} from "@/schemas/entities/video-durations/handlers/get-video-durations/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const getVideoDurationsRoute =
  createHonoApp().basePath("/video-durations");

// GET /api/v1/video-durations
getVideoDurationsRoute.get(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.VideoDurations],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Video durations retrieved successfully",
        schema: getVideoDurationsResponseSchema,
      }),
    },
  }),
  async (c) => {
    const foundVideoDurations = await db.query.videoDuration.findMany();

    return c.json<GetVideoDurationsResponse>(
      getVideoDurationsResponseSchema.parse({
        data: foundVideoDurations,
      }),
    );
  },
);
