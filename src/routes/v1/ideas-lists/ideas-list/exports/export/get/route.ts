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
import { getIdeasListExportParamsSchema } from "@/schemas/entities/ideas-lists/handlers/get-ideas-list-export/params";
import {
  type GetIdeasListExportResponse,
  getIdeasListExportResponseSchema,
} from "@/schemas/entities/ideas-lists/handlers/get-ideas-list-export/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const getIdeasListExportRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId/exports/:exportId",
);

// GET /api/v1/ideas-lists/{ideasListId}/exports/{exportId}
getIdeasListExportRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-ideas-list-export",
    windowMs: 60 * 1000,
    limit: 10,
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
  async (c) => {
    const { ideasListId, exportId } = c.req.valid("param");
    const user = c.get("user");

    const foundIdeasListExport = await db.query.ideasListExport.findFirst({
      where: (ideasListExport, { eq, and }) =>
        and(
          eq(ideasListExport.id, exportId),
          eq(ideasListExport.userId, user.id),
          eq(ideasListExport.ideasListId, ideasListId),
        ),
      with: {
        attachment: true,
      },
    });

    if (!foundIdeasListExport) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Экспорт списка идей не найден",
      });
    }

    return c.json<GetIdeasListExportResponse>(
      getIdeasListExportResponseSchema.parse({
        data: {
          ...foundIdeasListExport,
          url: foundIdeasListExport.attachment
            ? await getSignedS3Url(foundIdeasListExport.attachment.key)
            : null,
        },
      }),
      HTTPStatusCode.Ok,
    );
  },
);
