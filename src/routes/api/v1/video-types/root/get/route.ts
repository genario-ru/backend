import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import {
  type GetVideoTypesResponse,
  getVideoTypesResponseSchema,
} from "@/schemas/domains/video-types/handlers/get-video-types/response";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

export const getVideoTypesRoute = createHonoApp().basePath("/video-types");

// GET /api/v1/video-types
getVideoTypesRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-video-types",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.VideoTypes],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Video types retrieved successfully",
        schema: getVideoTypesResponseSchema,
      }),
    },
  }),
  async (c) => {
    const foundVideoTypes = await db.query.videoType.findMany();

    return c.json<GetVideoTypesResponse>(
      getVideoTypesResponseSchema.parse({
        data: foundVideoTypes,
      }),
    );
  },
);
