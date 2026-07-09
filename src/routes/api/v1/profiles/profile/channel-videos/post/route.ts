import { validator } from "hono-openapi";

import { createProfileChannelVideoBodySchema } from "@/domains/profiles/schemas/handlers/create-profile-channel-video/body";
import { createProfileChannelVideoParamsSchema } from "@/domains/profiles/schemas/handlers/create-profile-channel-video/params";
import {
  type CreateProfileChannelVideoResponse,
  createProfileChannelVideoResponseSchema,
} from "@/domains/profiles/schemas/handlers/create-profile-channel-video/response";
import { createProfileChannelVideo } from "@/domains/profiles/services/create-profile-channel-video";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const createProfileChannelVideoRoute = createHonoApp().basePath(
  "/profiles/:profileId/channel-videos",
);

// POST /api/v1/profiles/{profileId}/channel-videos
createProfileChannelVideoRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "create-profile-channel-video",
    windowMs: 1 * 1000,
    limit: 3,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Profiles],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Profile channel video created successfully",
        schema: createProfileChannelVideoResponseSchema,
      }),
    },
  }),
  validator("param", createProfileChannelVideoParamsSchema),
  validator("json", createProfileChannelVideoBodySchema),
  async (c) => {
    const { profileId } = c.req.valid("param");
    const { url } = c.req.valid("json");
    const user = c.get("user");

    const createdVideo = await createProfileChannelVideo({
      userId: user.id,
      profileId,
      url,
    });

    return c.json<CreateProfileChannelVideoResponse>(
      createProfileChannelVideoResponseSchema.parse({
        data: createdVideo,
      }),
      HTTPStatusCode.Ok,
    );
  },
);
