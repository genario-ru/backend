import { validator } from "hono-openapi";

import { getProfileAttachmentsParamsSchema } from "@/domains/profiles/schemas/handlers/get-profile-attachments/params";
import {
  type GetProfileAttachmentsResponse,
  getProfileAttachmentsResponseSchema,
} from "@/domains/profiles/schemas/handlers/get-profile-attachments/response";
import { getProfileAttachments } from "@/domains/profiles/services/get-profile-attachments";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getProfileAttachmentsRoute = createHonoApp().basePath(
  "/profiles/:profileId/attachments",
);

// GET /api/v1/profiles/{profileId}/attachments
getProfileAttachmentsRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-profile-attachments",
    windowMs: 1000,
    limit: 2,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Profiles],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Profile attachments retrieved successfully",
        schema: getProfileAttachmentsResponseSchema,
      }),
    },
  }),
  validator("param", getProfileAttachmentsParamsSchema),
  async (c) => {
    const { profileId } = c.req.valid("param");
    const user = c.get("user");

    const attachments = await getProfileAttachments({
      userId: user.id,
      profileId,
    });

    return c.json<GetProfileAttachmentsResponse>(
      getProfileAttachmentsResponseSchema.parse({
        data: attachments,
      }),
    );
  },
);
