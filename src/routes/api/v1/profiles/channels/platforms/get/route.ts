import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import {
  type GetPlatformsForChannelsResponse,
  getPlatformsForChannelsResponseSchema,
} from "@/schemas/domains/profiles/handlers/get-platforms-for-channels.ts/response";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

export const getPlatformsForChannelsRoute = createHonoApp().basePath(
  "/profiles/channels/platforms",
);

// GET /api/v1/profiles/channels/platforms
getPlatformsForChannelsRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-platforms-for-channels",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Profiles],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Platforms for channels retrieved successfully",
        schema: getPlatformsForChannelsResponseSchema,
      }),
    },
  }),
  async (c) => {
    const foundPlatforms = await db.query.platform.findMany({
      where: (platform, { eq }) => eq(platform.hasAutoImport, true),
    });

    return c.json<GetPlatformsForChannelsResponse>(
      getPlatformsForChannelsResponseSchema.parse({
        data: foundPlatforms,
      }),
    );
  },
);
