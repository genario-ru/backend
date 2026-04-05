import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import {
  type GetPlatformsResponse,
  getPlatformsResponseSchema,
} from "@/schemas/entities/platforms/handlers/get-platforms/response";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

export const getPlatformsRoute = createHonoApp().basePath("/platforms");

// GET /api/v1/platforms
getPlatformsRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-platforms",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Platforms],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Platforms retrieved successfully",
        schema: getPlatformsResponseSchema,
      }),
    },
  }),
  async (c) => {
    const foundPlatforms = await db.query.platform.findMany({
      with: {
        platformToVideoType: {
          with: { videoType: true },
        },
      },
    });

    const preparedPlatforms = foundPlatforms.map((platform) => ({
      ...platform,
      videoTypes: platform.platformToVideoType.map(
        ({ videoType }) => videoType,
      ),
    }));

    return c.json<GetPlatformsResponse>(
      getPlatformsResponseSchema.parse({
        data: preparedPlatforms,
      }),
    );
  },
);
