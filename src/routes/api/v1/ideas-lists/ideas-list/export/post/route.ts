import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { exportDocument, ideasListToExportDocument } from "@/db/schema";
import { createIdeasListExportBodySchema } from "@/domains/ideas-lists/schemas/handlers/create-ideas-list-export/body";
import { cerateIdeasListExportParamsSchema } from "@/domains/ideas-lists/schemas/handlers/create-ideas-list-export/params";
import {
  type CreateIdeasListExportResponse,
  createIdeasListExportResponseSchema,
} from "@/domains/ideas-lists/schemas/handlers/create-ideas-list-export/response";
import { getAttachmentDownloadUrl } from "@/lib/attachments/utils/get-attachment-download-url";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { enqueueIdeasListExport } from "@/mq/ideas-list-export/queue";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const getIdeasListExportRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId/export",
);

// POST /api/v1/ideas-lists/{ideasListId}/export
getIdeasListExportRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "post-ideas-list-export",
    windowMs: 5 * 1000,
    limit: 1,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.IdeasLists],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Ideas list export retrieved successfully",
        schema: createIdeasListExportResponseSchema,
      }),
    },
  }),
  validator("param", cerateIdeasListExportParamsSchema),
  validator("json", createIdeasListExportBodySchema),
  async (c) => {
    const { ideasListId } = c.req.valid("param");
    const { format, savedOnly } = c.req.valid("json");
    const user = c.get("user");
    const tariff = c.get("tariff");

    if (!tariff.exportAvailable) {
      throw throwAPIError({
        code: APIErrorCode.Forbidden,
        message: "Экспорт списков идей не доступен по тарифу вашей подписки",
      });
    }

    const foundIdeasList = await db.query.ideasList.findFirst({
      where: (ideasList, { eq, and }) =>
        and(eq(ideasList.id, ideasListId), eq(ideasList.userId, user.id)),
      with: {
        ideasListToExportDocument: {
          where: (link, { eq }) => eq(link.savedOnly, savedOnly),
          orderBy: (link, { desc }) => [desc(link.createdAt)],
          with: {
            exportDocument: {
              with: {
                format: true,
                attachment: true,
              },
            },
          },
        },
      },
    });

    if (!foundIdeasList) {
      throw throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный список идей не существует или у вас нет возможности экспортировать его",
      });
    }

    const foundExportDocument = foundIdeasList.ideasListToExportDocument
      .map((item) => item.exportDocument)
      .find((doc) => doc.format.slug === format);

    if (!foundExportDocument) {
      const foundFormat = await db.query.exportDocumentFormat.findFirst({
        where: (documentFormat, { eq }) => eq(documentFormat.slug, format),
      });

      if (!foundFormat) {
        throw throwAPIError({
          code: APIErrorCode.InvalidInput,
          message: "Данный формат документа не поддерживается",
        });
      }

      const createdExportDocument = await db.transaction(async (tx) => {
        const [createdExportDocument] = await tx
          .insert(exportDocument)
          .values({
            userId: user.id,
            formatId: foundFormat.id,
          })
          .returning();

        await tx.insert(ideasListToExportDocument).values({
          ideasListId,
          exportDocumentId: createdExportDocument.id,
          savedOnly,
        });

        return createdExportDocument;
      });

      await enqueueIdeasListExport({
        exportDocumentId: createdExportDocument.id,
        ideasListId,
      });

      return c.json<CreateIdeasListExportResponse>(
        createIdeasListExportResponseSchema.parse({
          data: {
            formatName: foundFormat.name,
            formatSlug: foundFormat.slug,
            formatColor: foundFormat.color,
            formatIcon: foundFormat.icon,
            documentStatus: createdExportDocument.status,
            documentStatusDetails: createdExportDocument.statusDetails,
            documentUrl: null,
          },
        }),
        HTTPStatusCode.Created,
      );
    }

    if (foundExportDocument.status === "failed") {
      const [updatedExportDocument] = await db
        .update(exportDocument)
        .set({
          status: "pending",
          statusDetails: null,
        })
        .where(eq(exportDocument.id, foundExportDocument.id))
        .returning();

      await enqueueIdeasListExport({
        exportDocumentId: foundExportDocument.id,
        ideasListId,
      });

      return c.json<CreateIdeasListExportResponse>(
        createIdeasListExportResponseSchema.parse({
          data: {
            formatName: foundExportDocument.format.name,
            formatSlug: foundExportDocument.format.slug,
            formatColor: foundExportDocument.format.color,
            formatIcon: foundExportDocument.format.icon,
            documentStatus: updatedExportDocument.status,
            documentStatusDetails: updatedExportDocument.statusDetails,
            documentUrl: null,
          },
        }),
        HTTPStatusCode.Ok,
      );
    }

    if (
      foundExportDocument.status === "ready" &&
      foundExportDocument.attachment
    ) {
      const url = getAttachmentDownloadUrl(foundExportDocument.attachment.id);

      return c.json<CreateIdeasListExportResponse>(
        createIdeasListExportResponseSchema.parse({
          data: {
            formatName: foundExportDocument.format.name,
            formatSlug: foundExportDocument.format.slug,
            formatColor: foundExportDocument.format.color,
            formatIcon: foundExportDocument.format.icon,
            documentStatus: foundExportDocument.status,
            documentStatusDetails: foundExportDocument.statusDetails,
            documentUrl: url,
          },
        }),
        HTTPStatusCode.Ok,
      );
    }

    return c.json<CreateIdeasListExportResponse>(
      createIdeasListExportResponseSchema.parse({
        data: {
          formatName: foundExportDocument.format.name,
          formatSlug: foundExportDocument.format.slug,
          formatColor: foundExportDocument.format.color,
          formatIcon: foundExportDocument.format.icon,
          documentStatus: foundExportDocument.status,
          documentStatusDetails: foundExportDocument.statusDetails,
          documentUrl: null,
        },
      }),
      HTTPStatusCode.Ok,
    );
  },
);
