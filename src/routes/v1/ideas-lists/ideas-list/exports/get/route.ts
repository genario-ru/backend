import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { getSignedS3Url } from "@/lib/s3/utils/get-signed-s3-url";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { getIdeasListExportsParamsSchema } from "@/schemas/entities/ideas-lists/handlers/get-ideas-list-exports/params";
import {
  type GetIdeasListExportsResponse,
  getIdeasListExportsResponseSchema,
  type IdeasListExportItem,
} from "@/schemas/entities/ideas-lists/handlers/get-ideas-list-exports/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

const ideasListExportFormats = [
  { name: "PDF", format: "pdf" as const },
  { name: "DOCX", format: "docx" as const },
];

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
  async (c) => {
    const { ideasListId } = c.req.valid("param");
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

    const foundIdeasListExports = await db.query.ideasListExport.findMany({
      where: (ideasListExport, { eq, and }) =>
        and(
          eq(ideasListExport.userId, user.id),
          eq(ideasListExport.ideasListId, ideasListId),
        ),
      orderBy: (ideasListExport, { desc }) => [desc(ideasListExport.createdAt)],
      with: {
        attachment: true,
      },
    });

    const exportsData: IdeasListExportItem[] = await Promise.all(
      ideasListExportFormats.map(async ({ name, format }) => {
        const latestExport = foundIdeasListExports.find(
          (item) => item.format === format,
        );

        if (!latestExport) {
          return {
            name,
            format,
            state: "idle",
            url: null,
          };
        }

        const url =
          latestExport.status === "ready" && latestExport.attachment
            ? await getSignedS3Url(latestExport.attachment.key)
            : null;

        return {
          name,
          format,
          state: latestExport.status,
          url,
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
