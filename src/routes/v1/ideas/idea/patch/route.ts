import { eq } from "drizzle-orm";

import { db } from "@/db";
import { idea } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { updateIdeaBodySchema } from "@/schemas/entities/ideas/handlers/update-idea/body";
import { updateIdeaParamsSchema } from "@/schemas/entities/ideas/handlers/update-idea/params";
import {
  type UpdateIdeaResponse,
  updateIdeaResponseSchema,
} from "@/schemas/entities/ideas/handlers/update-idea/response";
import { createHonoApp } from "@/utils/create-hono-app";
import { throwAPIError } from "@/utils/throw-api-error";

export const updateIdeaRoute = createHonoApp().basePath("/ideas/:ideaId");

// PATCH /api/v1/ideas/{ideaId}
updateIdeaRoute.patch("/", sessionMiddleware, async (c) => {
  const { ideaId } = updateIdeaParamsSchema.parse(c.req.param());
  const updateIdeaBody = updateIdeaBodySchema.parse(c.req.json());

  const foundIdeaVariant = await db.query.idea.findFirst({
    where: (idea, { eq }) => eq(idea.id, ideaId),
    with: { ideasList: true },
  });

  if (!foundIdeaVariant) {
    return throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Данная идея не существует",
    });
  }

  const user = c.get("user");

  if (foundIdeaVariant.ideasList.userId !== user.id) {
    return throwAPIError({
      code: APIErrorCode.Forbidden,
      message: "У вас нет прав для редактирования данной идеи",
    });
  }

  const [updatedIdea] = await db
    .update(idea)
    .set(updateIdeaBody)
    .where(eq(idea.id, ideaId))
    .returning();

  return c.json<UpdateIdeaResponse>(
    updateIdeaResponseSchema.parse({
      data: updatedIdea,
    }),
  );
});
