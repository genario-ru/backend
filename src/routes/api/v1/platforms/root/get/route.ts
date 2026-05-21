import { db } from "@/db";
import {
  type GetPlatformsResponse,
  getPlatformsResponseSchema,
} from "@/domains/platforms/schemas/handlers/get-platforms/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

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
      orderBy: (platform, { asc, desc }) => [
        desc(platform.priority),
        asc(platform.name),
      ],
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
