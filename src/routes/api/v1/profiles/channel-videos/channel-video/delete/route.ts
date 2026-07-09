import { validator } from "hono-openapi";

import { deleteProfileChannelVideoParamsSchema } from "@/domains/profiles/schemas/handlers/delete-profile-channel-video/params";
import {
  type DeleteProfileChannelVideoResponse,
  deleteProfileChannelVideoResponseSchema,
} from "@/domains/profiles/schemas/handlers/delete-profile-channel-video/response";
import { deleteProfileChannelVideo } from "@/domains/profiles/services/delete-profile-channel-video";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const deleteProfileChannelVideoRoute = createHonoApp().basePath(
  "/profiles/channel-videos/:profileChannelVideoId",
);

// DELETE /api/v1/profiles/channel-videos/{profileChannelVideoId}
deleteProfileChannelVideoRoute.delete(
  "/",
  rateLimitMiddleware({
    keyPrefix: "delete-profile-channel-video",
    windowMs: 2 * 1000,
    limit: 1,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Profiles],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Profile channel video deleted successfully",
        schema: deleteProfileChannelVideoResponseSchema,
      }),
    },
  }),
  validator("param", deleteProfileChannelVideoParamsSchema),
  async (c) => {
    const { profileChannelVideoId } = c.req.valid("param");
    const user = c.get("user");

    const deletedVideo = await deleteProfileChannelVideo({
      userId: user.id,
      profileChannelVideoId,
    });

    return c.json<DeleteProfileChannelVideoResponse>(
      deleteProfileChannelVideoResponseSchema.parse({
        data: deletedVideo,
      }),
    );
  },
);
