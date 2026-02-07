import { and, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { ideasList } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { enqueueIdeasGeneration } from "@/mq/queues/ideas-generation-queue";
import { APIErrorCode } from "@/schemas/common/api-error";
import { generateIdeasListBodySchema } from "@/schemas/entities/ideas-lists/handlers/generate-ideas-list/body";
import {
  type GenerateIdeasListResponse,
  generateIdeasListResponseSchema,
} from "@/schemas/entities/ideas-lists/handlers/generate-ideas-list/response";
import { updateIdeasListParamsSchema } from "@/schemas/entities/ideas-lists/handlers/update-ideas-list/params";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const generateIdeasListRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId/generate",
);

// POST /api/v1/ideas-lists/{ideasListId}/generate
generateIdeasListRoute.post(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.IdeasLists],
    responses: {
      [HTTPStatusCode.Accepted]: createOpenAPIResponse({
        description: "Ideas list generation queued successfully",
        schema: generateIdeasListResponseSchema,
      }),
    },
  }),
  validator("param", updateIdeasListParamsSchema),
  validator("json", generateIdeasListBodySchema),
  async (c) => {
    const { ideasListId } = c.req.valid("param");
    const { count } = c.req.valid("json");
    const user = c.get("user");

    const foundIdeasList = await db.query.ideasList.findFirst({
      where: (ideasList, { eq, and }) =>
        and(eq(ideasList.id, ideasListId), eq(ideasList.userId, user.id)),
    });

    if (!foundIdeasList) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный список идей не существует или у вас нет возможности редактировать его",
      });
    }

    await db
      .update(ideasList)
      .set({ status: "pending" })
      .where(and(eq(ideasList.id, ideasListId), eq(ideasList.userId, user.id)));

    const job = await enqueueIdeasGeneration({
      ideasListId,
      userId: user.id,
      count: count ?? 4,
      source: "manual",
    });

    return c.json<GenerateIdeasListResponse>(
      generateIdeasListResponseSchema.parse({
        data: {
          jobId: String(job.id),
          status: "queued",
        },
      }),
      HTTPStatusCode.Accepted,
    );
  },
);
