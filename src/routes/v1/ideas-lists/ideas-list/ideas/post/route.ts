import { db } from "@/db";
import { idea } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { createIdeaBodySchema } from "@/schemas/entities/ideas-lists/handlers/create-idea/body";
import { createIdeaParamsSchema } from "@/schemas/entities/ideas-lists/handlers/create-idea/params";
import {
  type CreateIdeaResponse,
  createIdeaResponseSchema,
} from "@/schemas/entities/ideas-lists/handlers/create-idea/response";
import { createHonoApp } from "@/utils/create-hono-app";
import { throwAPIError } from "@/utils/throw-api-error";

export const createIdeaRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId/ideas",
);

// POST /api/v1/ideas-lists/{ideasListId}/ideas
createIdeaRoute.post("/", sessionMiddleware, async (c) => {
  const { ideasListId } = createIdeaParamsSchema.parse(c.req.param());
  const body = await c.req.json();
  const createIdeaParams = createIdeaBodySchema.parse(body);
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
  );
});
