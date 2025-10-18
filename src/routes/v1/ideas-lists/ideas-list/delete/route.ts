import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { ideasList } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { deleteIdeasListParamsSchema } from "@/schemas/entities/ideas-lists/handlers/delete-ideas-list/params";
import {
  type DeleteIdeasListResponse,
  deleteIdeasListResponseSchema,
} from "@/schemas/entities/ideas-lists/handlers/delete-ideas-list/response";
import { createHonoApp } from "@/utils/create-hono-app";

export const deleteIdeasListRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId",
);

// DELETE /api/v1/ideas-lists/{ideasListId}
deleteIdeasListRoute.delete("/", sessionMiddleware, async (c) => {
  const { ideasListId } = deleteIdeasListParamsSchema.parse(c.req.param());
  const user = c.get("user");

  const [deletedIdeasList] = await db
    .delete(ideasList)
    .where(and(eq(ideasList.id, ideasListId), eq(ideasList.userId, user.id)))
    .returning();

  return c.json<DeleteIdeasListResponse>(
    deleteIdeasListResponseSchema.parse({
      data: deletedIdeasList,
    }),
  );
});
