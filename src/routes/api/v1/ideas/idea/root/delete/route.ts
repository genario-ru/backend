import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { idea } from "@/db/schema";
import { deleteIdeaParamsSchema } from "@/domains/ideas/schemas/handlers/delete-idea/params";
import {
  type DeleteIdeaResponse,
  deleteIdeaResponseSchema,
} from "@/domains/ideas/schemas/handlers/delete-idea/response";
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

export const deleteIdeaRoute = createHonoApp().basePath("/ideas/:ideaId");

// DELETE /api/v1/ideas/{ideaId}
deleteIdeaRoute.delete(
  "/",
  rateLimitMiddleware({
    keyPrefix: "delete-idea",
    windowMs: 3 * 1000,
    limit: 1,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Ideas],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Idea deleted successfully",
        schema: deleteIdeaResponseSchema,
      }),
    },
  }),
  validator("param", deleteIdeaParamsSchema),
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
