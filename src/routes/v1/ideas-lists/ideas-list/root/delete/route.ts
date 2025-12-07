import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";

import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { ideasList } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { deleteIdeasListParamsSchema } from "@/schemas/entities/ideas-lists/handlers/delete-ideas-list/params";
import {
  type DeleteIdeasListResponse,
  deleteIdeasListResponseSchema,
} from "@/schemas/entities/ideas-lists/handlers/delete-ideas-list/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const deleteIdeasListRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId",
);

// DELETE /api/v1/ideas-lists/{ideasListId}
deleteIdeasListRoute.delete(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.IdeasLists],
    responses: {
      200: createOpenAPIResponse({
        description: "Ideas list deleted successfully",
        schema: deleteIdeasListResponseSchema,
      }),
    },
  }),
  zValidator("param", deleteIdeasListParamsSchema),
  async (c) => {
    const { ideasListId } = c.req.valid("param");
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
  },
);
