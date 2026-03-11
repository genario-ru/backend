import { and, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { ideasListExport } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { enqueueIdeasListExportGeneration } from "@/mq/queues/ideas-list-export-generation-queue";
import { APIErrorCode } from "@/schemas/common/api-error";
import { createIdeasListExportBodySchema } from "@/schemas/entities/ideas-lists/handlers/create-ideas-list-export/body";
import { createIdeasListExportParamsSchema } from "@/schemas/entities/ideas-lists/handlers/create-ideas-list-export/params";
import {
  type CreateIdeasListExportResponse,
  createIdeasListExportResponseSchema,
} from "@/schemas/entities/ideas-lists/handlers/create-ideas-list-export/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const createIdeasListExportRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId/exports",
);

// POST /api/v1/ideas-lists/{ideasListId}/exports
createIdeasListExportRoute.post(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.IdeasLists],
    responses: {
      [HTTPStatusCode.Created]: createOpenAPIResponse({
        description: "Ideas list export created successfully",
        schema: createIdeasListExportResponseSchema,
      }),
    },
  }),
  validator("param", createIdeasListExportParamsSchema),
  validator("json", createIdeasListExportBodySchema),
  async (c) => {
    const { ideasListId } = c.req.valid("param");
    const { format, savedOnly } = c.req.valid("json");
    const user = c.get("user");

    const foundIdeasList = await db.query.ideasList.findFirst({
      where: (ideasList, { eq, and }) =>
        and(eq(ideasList.id, ideasListId), eq(ideasList.userId, user.id)),
      columns: {
        id: true,
      },
    });

    if (!foundIdeasList) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный список идей не существует или у вас нет возможности экспортировать его",
      });
    }

    const [createdExportJob] = await db
      .insert(ideasListExport)
      .values({
        userId: user.id,
        ideasListId,
        format,
        savedOnly: savedOnly ?? false,
      })
      .returning();

    await enqueueIdeasListExportGeneration({
      ideasListExportId: createdExportJob.id,
    });

    return c.json<CreateIdeasListExportResponse>(
      createIdeasListExportResponseSchema.parse({
        data: {
          ...createdExportJob,
          url: null,
        },
      }),
      HTTPStatusCode.Created,
    );
  },
);
