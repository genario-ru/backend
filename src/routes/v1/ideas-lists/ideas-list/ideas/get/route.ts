import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { idea } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { getIdeasParamsSchema } from "@/schemas/entities/ideas-lists/handlers/get-ideas/params";
import { getIdeasQuerySchema } from "@/schemas/entities/ideas-lists/handlers/get-ideas/query";
import {
  type GetIdeasResponse,
  getIdeasResponseSchema,
} from "@/schemas/entities/ideas-lists/handlers/get-ideas/response";
import { createHonoApp } from "@/utils/create-hono-app";
import { throwAPIError } from "@/utils/throw-api-error";

export const getIdeasRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId/ideas",
);

// GET /api/v1/ideas-lists/{ideasListId}/ideas
getIdeasRoute.get("/", sessionMiddleware, async (c) => {
  const { ideasListId } = getIdeasParamsSchema.parse(c.req.param());
  const query = c.req.query();
  const { saved } = getIdeasQuerySchema.parse(query);
  const user = c.get("user");

  const foundIdeasList = await db.query.ideasList.findFirst({
    where: (ideasList, { eq, and }) => {
      return and(eq(ideasList.id, ideasListId), eq(ideasList.userId, user.id));
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
    with: { videoType: true },
  });

  return c.json<GetIdeasResponse>(
    getIdeasResponseSchema.parse({
      data: foundIdeas,
    }),
  );
});
