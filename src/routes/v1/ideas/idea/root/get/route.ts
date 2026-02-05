import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { getIdeaParamsSchema } from "@/schemas/entities/ideas/handlers/get-idea/params";
import {
  type GetIdeaResponse,
  getIdeaResponseSchema,
} from "@/schemas/entities/ideas/handlers/get-idea/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const getIdeaRoute = createHonoApp().basePath("/ideas/:ideaId");

// GET /api/v1/ideas/{ideaId}
getIdeaRoute.get(
  "/",
  sessionMiddleware,
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
