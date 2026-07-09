import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { idea } from "@/db/schema";
import { updateIdeaBodySchema } from "@/domains/ideas/schemas/handlers/update-idea/body";
import { updateIdeaParamsSchema } from "@/domains/ideas/schemas/handlers/update-idea/params";
import {
  type UpdateIdeaResponse,
  updateIdeaResponseSchema,
} from "@/domains/ideas/schemas/handlers/update-idea/response";
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

export const updateIdeaRoute = createHonoApp().basePath("/ideas/:ideaId");

// PATCH /api/v1/ideas/{ideaId}
updateIdeaRoute.patch(
  "/",
  rateLimitMiddleware({
    keyPrefix: "update-idea",
    windowMs: 3000,
    limit: 1,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Ideas],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Idea updated successfully",
        schema: updateIdeaResponseSchema,
      }),
    },
  }),
  validator("param", updateIdeaParamsSchema),
  validator("json", updateIdeaBodySchema),
  async (c) => {
    const { ideaId } = c.req.valid("param");
    const updateIdeaBody = c.req.valid("json");

    const foundIdeaVariant = await db.query.idea.findFirst({
      where: (idea, { eq }) => eq(idea.id, ideaId),
      with: { ideasList: true },
    });

    if (!foundIdeaVariant) {
      throw throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Данная идея не существует",
      });
    }

    const user = c.get("user");

    if (foundIdeaVariant.ideasList.userId !== user.id) {
      throw throwAPIError({
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
  },
);
