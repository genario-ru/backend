import { validator } from "hono-openapi";

import { db } from "@/db";
import { getIdeaParamsSchema } from "@/domains/ideas/schemas/handlers/get-idea/params";
import {
  type GetIdeaResponse,
  getIdeaResponseSchema,
} from "@/domains/ideas/schemas/handlers/get-idea/response";
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

export const getIdeaRoute = createHonoApp().basePath("/ideas/:ideaId");

// GET /api/v1/ideas/{ideaId}
getIdeaRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-idea",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Ideas],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Idea retrieved successfully",
        schema: getIdeaResponseSchema,
      }),
    },
  }),
  validator("param", getIdeaParamsSchema),
  async (c) => {
    const { ideaId } = c.req.valid("param");
    const user = c.get("user");

    const foundIdea = await db.query.idea.findFirst({
      where: (idea, { eq }) => eq(idea.id, ideaId),
      with: {
        videoType: true,
        ideasList: {
          with: {
            profile: true,
            template: true,
            ideasListToTone: {
              with: { tone: true },
            },
            ideasListToVideoType: {
              with: { videoType: true },
            },
          },
        },
      },
    });

    if (!foundIdea) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Данная идея не существует",
      });
    }

    if (foundIdea.ideasList.userId !== user.id) {
      return throwAPIError({
        code: APIErrorCode.Forbidden,
        message: "У вас нет прав для просмотра данной идеи",
      });
    }

    const data = {
      ...foundIdea,
      ideasList: {
        ...foundIdea.ideasList,
        tones: foundIdea.ideasList.ideasListToTone.map(({ tone }) => tone),
        videoTypes: foundIdea.ideasList.ideasListToVideoType.map(
          ({ videoType }) => videoType,
        ),
      },
    };

    return c.json<GetIdeaResponse>(
      getIdeaResponseSchema.parse({
        data,
      }),
    );
  },
);
