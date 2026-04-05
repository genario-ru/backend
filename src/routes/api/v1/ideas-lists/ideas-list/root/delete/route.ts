import { and, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { ideasList } from "@/db/schema";
import { deleteIdeasListParamsSchema } from "@/domains/ideas-lists/schemas/handlers/delete-ideas-list/params";
import {
  type DeleteIdeasListResponse,
  deleteIdeasListResponseSchema,
} from "@/domains/ideas-lists/schemas/handlers/delete-ideas-list/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

export const deleteIdeasListRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId",
);

// DELETE /api/v1/ideas-lists/{ideasListId}
deleteIdeasListRoute.delete(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "delete-ideas-list",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.IdeasLists],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Ideas list deleted successfully",
        schema: deleteIdeasListResponseSchema,
      }),
    },
  }),
  validator("param", deleteIdeasListParamsSchema),
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
