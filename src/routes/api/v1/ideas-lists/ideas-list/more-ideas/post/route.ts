import { and, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { ideasList } from "@/db/schema";
import { generateMoreIdeasBodySchema } from "@/domains/ideas-lists/schemas/handlers/generate-more-ideas/body";
import {
  type GenerateMoreIdeasResponse,
  generateMoreIdeasResponseSchema,
} from "@/domains/ideas-lists/schemas/handlers/generate-more-ideas/response";
import { updateIdeasListParamsSchema } from "@/domains/ideas-lists/schemas/handlers/update-ideas-list/params";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { enqueueIdeasListGeneration } from "@/mq/ideas-list-generation/queue";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const generateMoreIdeasRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId/more-ideas",
);

// POST /api/v1/ideas-lists/{ideasListId}/more-ideas
generateMoreIdeasRoute.post(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "generate-more-ideas",
    windowMs: 60 * 1000,
    limit: 3,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.IdeasLists],
    responses: {
      [HTTPStatusCode.Accepted]: createOpenAPIResponse({
        description: "More ideas generation queued successfully",
        schema: generateMoreIdeasResponseSchema,
      }),
    },
  }),
  validator("param", updateIdeasListParamsSchema),
  validator("json", generateMoreIdeasBodySchema),
  async (c) => {
    const { ideasListId } = c.req.valid("param");
    const { userPrompt } = c.req.valid("json");
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

    const [updatedIdeasList] = await db
      .update(ideasList)
      .set({ status: "pending" })
      .where(and(eq(ideasList.id, ideasListId), eq(ideasList.userId, user.id)))
      .returning();

    await enqueueIdeasListGeneration({
      ideasListId,
      userId: user.id,
      userPrompt,
    });

    return c.json<GenerateMoreIdeasResponse>(
      generateMoreIdeasResponseSchema.parse({
        data: updatedIdeasList,
      }),
    );
  },
);
