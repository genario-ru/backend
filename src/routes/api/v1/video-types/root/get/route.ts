import { db } from "@/db";
import {
  type GetVideoTypesResponse,
  getVideoTypesResponseSchema,
} from "@/domains/video-types/schemas/handlers/get-video-types/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

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
