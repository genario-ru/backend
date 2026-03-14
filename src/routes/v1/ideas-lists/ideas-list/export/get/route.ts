import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { ideasListExport } from "@/db/schema";
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
    const { format } = c.req.valid("json");
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

    const foundIdeasListExport = await db.query.ideasListExport.findFirst({
      where: (ideasListExport, { eq, and }) =>
        and(
          eq(ideasListExport.userId, user.id),
          eq(ideasListExport.ideasListId, ideasListId),
          eq(ideasListExport.format, format),
        ),
      orderBy: (ideasListExport, { desc }) => [desc(ideasListExport.createdAt)],
      with: {
        attachment: true,
      },
    });

    if (!foundIdeasListExport) {
      const [createdIdeasListExport] = await db
        .insert(ideasListExport)
        .values({
          userId: user.id,
          ideasListId,
          format,
        })
        .returning();

      await enqueueIdeasListExport({
        ideasListExportId: createdIdeasListExport.id,
      });

      return c.json<GetIdeasListExportResponse>(
        getIdeasListExportResponseSchema.parse({
          data: {
            ...createdIdeasListExport,
            url: null,
          },
        }),
        HTTPStatusCode.Created,
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
            ...foundIdeasListExport,
            url,
          },
        }),
        HTTPStatusCode.Ok,
      );
    }

    return c.json<GetIdeasListExportResponse>(
      getIdeasListExportResponseSchema.parse({
        data: {
          ...foundIdeasListExport,
          url: null,
        },
      }),
      HTTPStatusCode.Ok,
    );
  },
);
