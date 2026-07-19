import { validator } from "hono-openapi";

import { db } from "@/db";
import { getIdeasListParamsSchema } from "@/domains/ideas-lists/schemas/handlers/get-ideas-list/params";
import { getIdeasListQuerySchema } from "@/domains/ideas-lists/schemas/handlers/get-ideas-list/query";
import {
  type GetIdeasListResponse,
  getIdeasListResponseSchema,
} from "@/domains/ideas-lists/schemas/handlers/get-ideas-list/response";
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

export const getIdeasListRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId",
);

// GET /api/v1/ideas-lists/{ideasListId}
getIdeasListRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-ideas-list",
    windowMs: 1000,
    limit: 2,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.IdeasLists],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Ideas list retrieved successfully",
        schema: getIdeasListResponseSchema,
      }),
    },
  }),
  validator("param", getIdeasListParamsSchema),
  validator("query", getIdeasListQuerySchema),
  async (c) => {
    const { ideasListId } = c.req.valid("param");
    const { saved } = c.req.valid("query");
    const user = c.get("user");

    const foundIdeasList = await db.query.ideasList.findFirst({
      where: (ideasList, { eq, and }) => {
        return and(
          eq(ideasList.id, ideasListId),
          eq(ideasList.userId, user.id),
        );
      },
      with: {
        ideas: {
          orderBy: (idea, { asc, desc }) => [
            desc(idea.createdAt),
            asc(idea.name),
          ],
          where: (idea, { eq }) => {
            if (saved !== undefined) {
              return eq(idea.saved, saved);
            }

            return undefined;
          },
        },
        template: true,
        profile: true,
        ideasListToTone: {
          with: { tone: true },
        },
        ideasListToVideoType: {
          with: { videoType: true },
        },
      },
    });

    if (!foundIdeasList) {
      throw throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный список идей не существует или у вас нет возможности просматривать идеи внутри него",
      });
    }

    const { ideasListToTone, ideasListToVideoType, ...ideasList } =
      foundIdeasList;

    return c.json<GetIdeasListResponse>(
      getIdeasListResponseSchema.parse({
        data: {
          ...ideasList,
          tones: ideasListToTone.map(({ tone }) => tone),
          videoTypes: ideasListToVideoType.map(({ videoType }) => videoType),
        },
      }),
    );
  },
);
