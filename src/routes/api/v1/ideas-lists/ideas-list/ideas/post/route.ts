import { validator } from "hono-openapi";

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
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const createIdeaRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId/ideas",
);

// POST /api/v1/ideas-lists/{ideasListId}/ideas
createIdeaRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "create-idea",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  sessionMiddleware,
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
