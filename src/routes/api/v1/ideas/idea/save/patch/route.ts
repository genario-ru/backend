import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { idea } from "@/db/schema";
import { saveIdeaBodySchema } from "@/domains/ideas/schemas/handlers/save-idea/body";
import { saveIdeaParamsSchema } from "@/domains/ideas/schemas/handlers/save-idea/params";
import {
  type SaveIdeaResponse,
  saveIdeaResponseSchema,
} from "@/domains/ideas/schemas/handlers/save-idea/response";
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

export const saveIdeaRoute = createHonoApp().basePath("/ideas/:ideaId");

// PATCH /api/v1/ideas/{ideaId}/save
saveIdeaRoute.patch(
  "/save",
  rateLimitMiddleware({
    keyPrefix: "save-idea",
    windowMs: 60 * 1000,
    limit: 30,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Ideas],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Idea saved/unsaved successfully",
        schema: saveIdeaResponseSchema,
      }),
    },
  }),
  validator("param", saveIdeaParamsSchema),
  validator("json", saveIdeaBodySchema),
  async (c) => {
    const { ideaId } = c.req.valid("param");
    const { saved } = c.req.valid("json");

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
        message: "У вас нет прав для сохранения данной идеи",
      });
    }

    const [updatedIdea] = await db
      .update(idea)
      .set({ saved })
      .where(eq(idea.id, ideaId))
      .returning();

    return c.json<SaveIdeaResponse>(
      saveIdeaResponseSchema.parse({
        data: updatedIdea,
      }),
    );
  },
);
