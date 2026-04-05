import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { idea } from "@/db/schema";
import { createIdeaBodySchema } from "@/domains/ideas-lists/schemas/handlers/create-idea/body";
import { createIdeaParamsSchema } from "@/domains/ideas-lists/schemas/handlers/create-idea/params";
import {
  type CreateIdeaResponse,
  createIdeaResponseSchema,
} from "@/domains/ideas-lists/schemas/handlers/create-idea/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

export const createIdeaRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId/ideas",
);

// POST /api/v1/ideas-lists/{ideasListId}/ideas
createIdeaRoute.post(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "create-idea",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.IdeasLists],
    responses: {
      [HTTPStatusCode.Created]: createOpenAPIResponse({
        description: "Idea created successfully",
        schema: createIdeaResponseSchema,
      }),
    },
  }),
  validator("param", createIdeaParamsSchema),
  validator("json", createIdeaBodySchema),
  async (c) => {
    const { ideasListId } = c.req.valid("param");
    const createIdeaParams = c.req.valid("json");
    const user = c.get("user");

    const foundIdeasList = await db.query.ideasList.findFirst({
      where: (ideasList, { eq, and }) =>
        and(eq(ideasList.id, ideasListId), eq(ideasList.userId, user.id)),
    });

    if (!foundIdeasList) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный список идей не существует или у вас нет возможности создавать идеи внутри него",
      });
    }

    const [createdIdea] = await db
      .insert(idea)
      .values({
        ideasListId,
        ...createIdeaParams,
      })
      .returning();

    return c.json<CreateIdeaResponse>(
      createIdeaResponseSchema.parse({
        data: createdIdea,
      }),
      HTTPStatusCode.Created,
    );
  },
);
