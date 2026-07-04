import { bodyLimit } from "hono/body-limit";
import { validator } from "hono-openapi";

import { createAttachmentBodySchema } from "@/domains/attachments/schemas/handlers/create-attachment/body";
import {
  type CreateAttachmentResponse,
  createAttachmentResponseSchema,
} from "@/domains/attachments/schemas/handlers/create-attachment/response";
import { createAttachmentFromFile } from "@/domains/attachments/services/create-attachment-from-file";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

const MAX_ATTACHMENT_SIZE_BYTES = 250 * 1024 * 1024;

export const createAttachmentRoute = createHonoApp().basePath("/attachments");

// POST /api/v1/attachments
createAttachmentRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "create-attachment",
    windowMs: 5 * 1000,
    limit: 3,
  }),
  sessionMiddleware,
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
    tags: [OpenAPITags.Attachments],
    responses: {
      [HTTPStatusCode.Created]: createOpenAPIResponse({
        description: "Attachment created successfully",
        schema: createAttachmentResponseSchema,
      }),
    },
  }),
  validator("form", createAttachmentBodySchema),
  async (c) => {
    const { file } = c.req.valid("form");
    const user = c.get("user");

    const createdAttachment = await createAttachmentFromFile({
      userId: user.id,
      file,
    });

    return c.json<CreateAttachmentResponse>(
      createAttachmentResponseSchema.parse({
        data: createdAttachment,
      }),
      HTTPStatusCode.Created,
    );
  },
);
