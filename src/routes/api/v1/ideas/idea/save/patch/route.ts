import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { idea } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { saveIdeaBodySchema } from "@/schemas/domains/ideas/handlers/save-idea/body";
import { saveIdeaParamsSchema } from "@/schemas/domains/ideas/handlers/save-idea/params";
import {
  type SaveIdeaResponse,
  saveIdeaResponseSchema,
} from "@/schemas/domains/ideas/handlers/save-idea/response";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

export const saveIdeaRoute = createHonoApp().basePath("/ideas/:ideaId");

// PATCH /api/v1/ideas/{ideaId}/save
saveIdeaRoute.patch(
  "/save",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "save-idea",
    windowMs: 60 * 1000,
    limit: 10,
  }),
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
