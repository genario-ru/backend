import { and, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { idea } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { getIdeasParamsSchema } from "@/schemas/entities/ideas-lists/handlers/get-ideas/params";
import { getIdeasQuerySchema } from "@/schemas/entities/ideas-lists/handlers/get-ideas/query";
import {
  type GetIdeasResponse,
  getIdeasResponseSchema,
} from "@/schemas/entities/ideas-lists/handlers/get-ideas/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const getIdeasRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId/ideas",
);

// GET /api/v1/ideas-lists/{ideasListId}/ideas
getIdeasRoute.get(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.IdeasLists],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Ideas list retrieved successfully",
        schema: getIdeasResponseSchema,
      }),
    },
  }),
  validator("param", getIdeasParamsSchema),
  validator("query", getIdeasQuerySchema),
  async (c) => {
    const { ideasListId } = c.req.valid("param");
    const { saved } = c.req.valid("query");
    const user = c.get("user");

    const foundIdeasList = await db.query.ideasList.findFirst({
      where: (ideasList, { eq, and }) => {
        return and(
          eq(ideasList.id, ideasListId),
          eq(ideasList.userId, user.id),
        );
      },
    });

    if (!foundIdeasList) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный список идей не существует или у вас нет возможности просматривать идеи внутри него",
      });
    }

    const ideasWhereConditions = [eq(idea.ideasListId, ideasListId)];

    if (saved !== undefined) {
      ideasWhereConditions.push(eq(idea.saved, saved));
    }

    const foundIdeas = await db.query.idea.findMany({
      where: and(...ideasWhereConditions),
      orderBy: (idea, { desc }) => [desc(idea.createdAt)],
    });

    return c.json<GetIdeasResponse>(
      getIdeasResponseSchema.parse({
        data: foundIdeas,
      }),
    );
  },
);
