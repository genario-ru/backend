import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { idea } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { deleteIdeaParamsSchema } from "@/schemas/entities/ideas/handlers/delete-idea/params";
import {
  type DeleteIdeaResponse,
  deleteIdeaResponseSchema,
} from "@/schemas/entities/ideas/handlers/delete-idea/response";
import { createHonoApp } from "@/utils/create-hono-app";
import { throwAPIError } from "@/utils/throw-api-error";

export const deleteIdeaRoute = createHonoApp().basePath("/ideas/:ideaId");

// DELETE /api/v1/ideas/{ideaId}
deleteIdeaRoute.patch(
  "/",
  sessionMiddleware,
  zValidator("param", deleteIdeaParamsSchema),
  async (c) => {
    const { ideaId } = c.req.valid("param");

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
        message: "У вас нет прав для удаления данной идеи",
      });
    }

    const [deletedIdea] = await db
      .delete(idea)
      .where(eq(idea.id, ideaId))
      .returning();

    return c.json<DeleteIdeaResponse>(
      deleteIdeaResponseSchema.parse({
        data: deletedIdea,
      }),
    );
  },
);
