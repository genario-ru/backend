import { validator } from "hono-openapi";

import { db } from "@/db";
import type { ExportDocumentShort } from "@/domains/export-document/schemas/entities/export-document";
import { getIdeasListExportsParamsSchema } from "@/domains/ideas-lists/schemas/handlers/get-ideas-list-exports/params";
import { getIdeasListExportsQuerySchema } from "@/domains/ideas-lists/schemas/handlers/get-ideas-list-exports/query";
import {
  type GetIdeasListExportsResponse,
  getIdeasListExportsResponseSchema,
} from "@/domains/ideas-lists/schemas/handlers/get-ideas-list-exports/response";
import { getAttachmentDownloadUrl } from "@/lib/attachments/utils/get-attachment-download-url";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const getIdeasListExportsRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId/exports",
);

// GET /api/v1/ideas-lists/{ideasListId}/exports
getIdeasListExportsRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-ideas-list-exports",
    windowMs: 1000,
    limit: 2,
  }),
  sessionMiddleware,
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
