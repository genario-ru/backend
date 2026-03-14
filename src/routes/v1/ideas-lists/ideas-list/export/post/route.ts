import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { exportDocument, ideasListToExportDocument } from "@/db/schema";
import { getSignedS3Url } from "@/lib/s3/utils/get-signed-s3-url";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { enqueueIdeasListExport } from "@/mq/ideas-list/ideas-list-export/queue";
import { APIErrorCode } from "@/schemas/common/api-error";
import { getIdeasListExportBodySchema } from "@/schemas/entities/ideas-lists/handlers/get-ideas-list-export/body";
import { getIdeasListExportParamsSchema } from "@/schemas/entities/ideas-lists/handlers/get-ideas-list-export/params";
import {
  type GetIdeasListExportResponse,
  getIdeasListExportResponseSchema,
} from "@/schemas/entities/ideas-lists/handlers/get-ideas-list-export/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const getIdeasListExportRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId/export",
);

// POST /api/v1/ideas-lists/{ideasListId}/export
getIdeasListExportRoute.post(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "post-ideas-list-export",
    windowMs: 60 * 1000,
    limit: 20,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.IdeasLists],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Ideas list export retrieved successfully",
        schema: getIdeasListExportResponseSchema,
      }),
    },
  }),
  validator("param", getIdeasListExportParamsSchema),
  validator("json", getIdeasListExportBodySchema),
  async (c) => {
    const { ideasListId } = c.req.valid("param");
    const { format, saved } = c.req.valid("json");
    const user = c.get("user");
    const tariff = c.get("tariff");

    if (!tariff.exportAvailable) {
      return throwAPIError({
        code: APIErrorCode.Forbidden,
        message: "Экспорт списков идей не доступен по тарифу вашей подписки",
      });
    }

    const foundIdeasList = await db.query.ideasList.findFirst({
      where: (ideasList, { eq, and }) =>
        and(eq(ideasList.id, ideasListId), eq(ideasList.userId, user.id)),
    });

    if (!foundIdeasList) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный список идей не существует или у вас нет возможности экспортировать его",
      });
    }

    const foundLinks = await db.query.ideasListToExportDocument.findMany({
      where: (link, { eq, and }) =>
        and(eq(link.ideasListId, ideasListId), eq(link.savedOnly, saved)),
      orderBy: (link, { desc }) => [desc(link.createdAt)],
      with: {
        exportDocument: {
          with: {
            format: true,
            attachment: true,
          },
        },
      },
    });

    const foundIdeasListExport = foundLinks
      .map((item) => item.exportDocument)
      .find((doc) => doc.format.slug === format);

    if (!foundIdeasListExport) {
      const foundFormat = await db.query.exportDocumentFormat.findFirst({
        where: (documentFormat, { eq }) => eq(documentFormat.slug, format),
      });

      if (!foundFormat) {
        return throwAPIError({
          code: APIErrorCode.InternalServerError,
          message: `Формат экспорта '${format}' не настроен в таблице export_document_format`,
        });
      }

      const [createdIdeasListExport] = await db.transaction(async (tx) => {
        const [doc] = await tx
          .insert(exportDocument)
          .values({
            userId: user.id,
            formatId: foundFormat.id,
          })
          .returning();

        await tx.insert(ideasListToExportDocument).values({
          ideasListId,
          exportDocumentId: doc.id,
          savedOnly: saved,
        });

        return [doc];
      });

      await enqueueIdeasListExport({
        exportDocumentId: createdIdeasListExport.id,
        ideasListId,
        savedOnly: saved,
      });

      return c.json<GetIdeasListExportResponse>(
        getIdeasListExportResponseSchema.parse({
          data: {
            name: foundFormat.name,
            format: foundFormat.slug,
            status: createdIdeasListExport.status,
            url: null,
          },
        }),
        HTTPStatusCode.Created,
      );
    }

    if (foundIdeasListExport.status === "failed") {
      await db
        .update(exportDocument)
        .set({
          status: "pending",
          error: null,
        })
        .where(eq(exportDocument.id, foundIdeasListExport.id));

      await enqueueIdeasListExport({
        exportDocumentId: foundIdeasListExport.id,
        ideasListId,
        savedOnly: saved,
      });

      return c.json<GetIdeasListExportResponse>(
        getIdeasListExportResponseSchema.parse({
          data: {
            name: foundIdeasListExport.format.name,
            format: foundIdeasListExport.format.slug,
            status: "pending",
            url: null,
          },
        }),
        HTTPStatusCode.Ok,
      );
    }

    if (
      foundIdeasListExport.status === "ready" &&
      foundIdeasListExport.attachment
    ) {
      const url = await getSignedS3Url(foundIdeasListExport.attachment.key);

      return c.json<GetIdeasListExportResponse>(
        getIdeasListExportResponseSchema.parse({
          data: {
            name: foundIdeasListExport.format.name,
            format: foundIdeasListExport.format.slug,
            status: foundIdeasListExport.status,
            url,
          },
        }),
        HTTPStatusCode.Ok,
      );
    }

    return c.json<GetIdeasListExportResponse>(
      getIdeasListExportResponseSchema.parse({
        data: {
          name: foundIdeasListExport.format.name,
          format: foundIdeasListExport.format.slug,
          status: foundIdeasListExport.status,
          url: null,
        },
      }),
      HTTPStatusCode.Ok,
    );
  },
);
