import { validator } from "hono-openapi";

import { getProfileChannelVideosQuerySchema } from "@/domains/profiles/schemas/handlers/get-profile-channel-videos/query";
import {
  type GetProfileChannelVideosResponse,
  getProfileChannelVideosResponseSchema,
} from "@/domains/profiles/schemas/handlers/get-profile-channel-videos/response";
import { getProfileChannelVideos } from "@/domains/profiles/services/get-profile-channel-videos";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getProfileChannelVideosRoute = createHonoApp().basePath(
  "/profiles/channels/videos",
);

// GET /api/v1/profiles/channels/videos
getProfileChannelVideosRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-profile-channel-videos",
    windowMs: 1000,
    limit: 2,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Profiles],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Profile channel videos retrieved successfully",
        schema: getProfileChannelVideosResponseSchema,
      }),
    },
  }),
  validator("query", getProfileChannelVideosQuerySchema),
  async (c) => {
    const { profileId } = c.req.valid("query");
    const user = c.get("user");

    const videos = await getProfileChannelVideos({
      userId: user.id,
      profileId,
    });

    return c.json<GetProfileChannelVideosResponse>(
      getProfileChannelVideosResponseSchema.parse({
        data: videos,
      }),
      HTTPStatusCode.Ok,
    );
  },
);
