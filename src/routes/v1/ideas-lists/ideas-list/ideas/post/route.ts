import { zValidator } from "@hono/zod-validator";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { idea } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { createIdeaBodySchema } from "@/schemas/entities/ideas-lists/handlers/create-idea/body";
import { createIdeaParamsSchema } from "@/schemas/entities/ideas-lists/handlers/create-idea/params";
import {
  type CreateIdeaResponse,
  createIdeaResponseSchema,
} from "@/schemas/entities/ideas-lists/handlers/create-idea/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const createIdeaRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId/ideas",
);

// POST /api/v1/ideas-lists/{ideasListId}/ideas
createIdeaRoute.post(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.IdeasLists],
    responses: {
      [HTTPStatusCode.Created]: createOpenAPIResponse({
        description: "Idea created successfully",
        schema: createIdeaResponseSchema,
      }),
    },
  }),
  zValidator("param", createIdeaParamsSchema),
  zValidator("json", createIdeaBodySchema),
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
