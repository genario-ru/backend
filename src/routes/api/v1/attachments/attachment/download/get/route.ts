import { GetObjectCommand } from "@aws-sdk/client-s3";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { s3 } from "@/lib/s3/client";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { getAttachmentDownloadParamsSchema } from "@/schemas/entities/attachments/handlers/get-attachment-download/params";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

import {
  createContentDisposition,
  getAttachmentDownloadFileName,
  hasTransformToByteArray,
} from "./utils";

export const getAttachmentDownloadRoute = createHonoApp().basePath(
  "/attachments/:attachmentId/download",
);

// GET /api/v1/attachments/{attachmentId}/download
getAttachmentDownloadRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-attachment-download",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Attachments],
    responses: {
      [HTTPStatusCode.Ok]: {
        description: "Attachment downloaded successfully",
        content: {
          "application/octet-stream": {
            schema: {
              type: "string",
              format: "binary",
            },
          },
        },
      },
    },
  }),
  validator("param", getAttachmentDownloadParamsSchema),
  async (c) => {
    const { attachmentId } = c.req.valid("param");
    const user = c.get("user");

    const foundAttachment = await db.query.attachment.findFirst({
      where: (attachment, { eq, and }) =>
        and(eq(attachment.id, attachmentId), eq(attachment.userId, user.id)),
    });

    if (!foundAttachment) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Файл не найден или у вас нет доступа к нему",
      });
    }

    try {
      const s3Object = await s3.send(
        new GetObjectCommand({
          Bucket: foundAttachment.bucketName,
          Key: foundAttachment.key,
        }),
      );

      if (!s3Object.Body) {
        return throwAPIError({
          code: APIErrorCode.InternalServerError,
          message: "Не удалось получить файл из хранилища",
        });
      }

      const fileName = getAttachmentDownloadFileName(
        foundAttachment.id,
        foundAttachment.key,
      );

      const headers = new Headers({
        "Content-Disposition": createContentDisposition(fileName),
        "Content-Type": foundAttachment.mimeType,
      });

      if (s3Object.ContentLength !== undefined) {
        headers.set("Content-Length", String(s3Object.ContentLength));
      }

      if (!hasTransformToByteArray(s3Object.Body)) {
        return throwAPIError({
          code: APIErrorCode.InternalServerError,
          message: "Неподдерживаемый формат ответа хранилища",
        });
      }

      const fileContent = new Uint8Array(
        await s3Object.Body.transformToByteArray(),
      );

      return new Response(fileContent, {
        status: HTTPStatusCode.Ok,
        headers,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "NoSuchKey" || error.name === "NotFound")
      ) {
        return throwAPIError({
          code: APIErrorCode.NotFound,
          message: "Файл не найден в хранилище",
        });
      }

      throw error;
    }
  },
);
