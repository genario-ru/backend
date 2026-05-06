import { db } from "@/db";
import {
  type GetVideoDurationsResponse,
  getVideoDurationsResponseSchema,
} from "@/domains/video-durations/schemas/handlers/get-video-durations/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getVideoDurationsRoute =
  createHonoApp().basePath("/video-durations");

// GET /api/v1/video-durations
getVideoDurationsRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-video-durations",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
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
    const foundVideoDurations = await db.query.videoDuration.findMany({
      orderBy: (videoDuration, { asc }) => asc(videoDuration.name),
    });

    return c.json<GetVideoDurationsResponse>(
      getVideoDurationsResponseSchema.parse({
        data: foundVideoDurations,
      }),
    );
  },
);
