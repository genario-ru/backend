import { bodyLimit } from "hono/body-limit";
import { validator } from "hono-openapi";

import { createProfileAttachmentBodySchema } from "@/domains/profiles/schemas/handlers/create-profile-attachment/body";
import { createProfileAttachmentParamsSchema } from "@/domains/profiles/schemas/handlers/create-profile-attachment/params";
import {
  type CreateProfileAttachmentResponse,
  createProfileAttachmentResponseSchema,
} from "@/domains/profiles/schemas/handlers/create-profile-attachment/response";
import { createProfileAttachmentFromFile } from "@/domains/profiles/services/create-profile-attachment-from-file";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

const MAX_ATTACHMENT_SIZE_BYTES = 250 * 1024 * 1024;

export const createProfileAttachmentRoute = createHonoApp().basePath(
  "/profiles/:profileId/attachments",
);

// POST /api/v1/profiles/{profileId}/attachments
createProfileAttachmentRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "create-profile-attachment",
    windowMs: 1 * 1000,
    limit: 10,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  bodyLimit({
    maxSize: MAX_ATTACHMENT_SIZE_BYTES,
    onError: (c) =>
      c.json(
        {
          code: APIErrorCode.FileTooLarge,
          statusCode: HTTPStatusCode.PayloadTooLarge,
          message: "Размер файла превышает допустимый лимит в 250 МБ",
        },
        HTTPStatusCode.PayloadTooLarge,
      ),
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Profiles],
    responses: {
      [HTTPStatusCode.Created]: createOpenAPIResponse({
        description: "Profile attachment created successfully",
        schema: createProfileAttachmentResponseSchema,
      }),
    },
  }),
  validator("param", createProfileAttachmentParamsSchema),
  validator("form", createProfileAttachmentBodySchema),
  async (c) => {
    const { profileId } = c.req.valid("param");
    const { file, type } = c.req.valid("form");
    const user = c.get("user");

    const createdProfileAttachment = await createProfileAttachmentFromFile({
      userId: user.id,
      profileId,
      type,
      file,
    });

    return c.json<CreateProfileAttachmentResponse>(
      createProfileAttachmentResponseSchema.parse({
        data: createdProfileAttachment,
      }),
      HTTPStatusCode.Created,
    );
  },
);
