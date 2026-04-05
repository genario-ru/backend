import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import {
  type GetVideoDurationsResponse,
  getVideoDurationsResponseSchema,
} from "@/schemas/domains/video-durations/handlers/get-video-durations/response";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

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
    const foundVideoDurations = await db.query.videoDuration.findMany();

    return c.json<GetVideoDurationsResponse>(
      getVideoDurationsResponseSchema.parse({
        data: foundVideoDurations,
      }),
    );
  },
);
