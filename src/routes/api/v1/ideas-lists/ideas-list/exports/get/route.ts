import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { getAttachmentDownloadUrl } from "@/lib/attachments/utils/get-attachment-download-url";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import type { ExportDocumentShort } from "@/schemas/entities/export-document/entities/export-document";
import { getIdeasListExportsParamsSchema } from "@/schemas/entities/ideas-lists/handlers/get-ideas-list-exports/params";
import { getIdeasListExportsQuerySchema } from "@/schemas/entities/ideas-lists/handlers/get-ideas-list-exports/query";
import {
  type GetIdeasListExportsResponse,
  getIdeasListExportsResponseSchema,
} from "@/schemas/entities/ideas-lists/handlers/get-ideas-list-exports/response";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

export const getIdeasListExportsRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId/exports",
);

// GET /api/v1/ideas-lists/{ideasListId}/exports
getIdeasListExportsRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-ideas-list-exports",
    windowMs: 60 * 1000,
    limit: 20,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.IdeasLists],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Ideas list exports retrieved successfully",
        schema: getIdeasListExportsResponseSchema,
      }),
    },
  }),
  validator("param", getIdeasListExportsParamsSchema),
  validator("query", getIdeasListExportsQuerySchema),
  async (c) => {
    const { ideasListId } = c.req.valid("param");
    const { savedOnly } = c.req.valid("query");
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
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный список идей не существует или у вас нет возможности экспортировать его",
      });
    }

    const foundExportDocumentFormats =
      await db.query.exportDocumentFormat.findMany();

    const exportsData: ExportDocumentShort[] = await Promise.all(
      foundExportDocumentFormats.map(async (format) => {
        const latestExport = foundIdeasList.ideasListToExportDocument
          .map((item) => item.exportDocument)
          .find((item) => item.format.slug === format.slug);

        if (!latestExport?.attachment) {
          return {
            formatName: format.name,
            formatSlug: format.slug,
            formatColor: format.color,
            formatIcon: format.icon,
            documentStatus: latestExport?.status ?? "idle",
            documentStatusDetails: latestExport?.statusDetails ?? null,
            documentUrl: null,
          };
        }

        const url = getAttachmentDownloadUrl(latestExport.attachment.id);

        return {
          formatName: format.name,
          formatSlug: format.slug,
          formatColor: format.color,
          formatIcon: format.icon,
          documentStatus: latestExport.status,
          documentStatusDetails: latestExport.statusDetails,
          documentUrl: url,
        };
      }),
    );

    return c.json<GetIdeasListExportsResponse>(
      getIdeasListExportsResponseSchema.parse({
        data: exportsData,
      }),
      HTTPStatusCode.Ok,
    );
  },
);
