import { validator } from "hono-openapi";

import { deleteProfileAttachmentParamsSchema } from "@/domains/profiles/schemas/handlers/delete-profile-attachment/params";
import {
  type DeleteProfileAttachmentResponse,
  deleteProfileAttachmentResponseSchema,
} from "@/domains/profiles/schemas/handlers/delete-profile-attachment/response";
import { deleteProfileAttachment } from "@/domains/profiles/services/delete-profile-attachment";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const deleteProfileAttachmentRoute = createHonoApp().basePath(
  "/profiles/attachments/:attachmentId",
);

// DELETE /api/v1/profiles/attachments/{attachmentId}
deleteProfileAttachmentRoute.delete(
  "/",
  rateLimitMiddleware({
    keyPrefix: "delete-profile-attachment",
    windowMs: 1 * 1000,
    limit: 3,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Profiles],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Profile attachment deleted successfully",
        schema: deleteProfileAttachmentResponseSchema,
      }),
    },
  }),
  validator("param", deleteProfileAttachmentParamsSchema),
  async (c) => {
    const { attachmentId } = c.req.valid("param");
    const user = c.get("user");

    const deletedAttachment = await deleteProfileAttachment({
      userId: user.id,
      attachmentId,
    });

    return c.json<DeleteProfileAttachmentResponse>(
      deleteProfileAttachmentResponseSchema.parse({
        data: deletedAttachment,
      }),
    );
  },
);
