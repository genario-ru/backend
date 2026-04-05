import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { getIdeasListParamsSchema } from "@/schemas/entities/ideas-lists/handlers/get-ideas-list/params";
import { getIdeasListQuerySchema } from "@/schemas/entities/ideas-lists/handlers/get-ideas-list/query";
import {
  type GetIdeasListResponse,
  getIdeasListResponseSchema,
} from "@/schemas/entities/ideas-lists/handlers/get-ideas-list/response";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

export const getIdeasListRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId",
);

// GET /api/v1/ideas-lists/{ideasListId}
getIdeasListRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-ideas-list",
    windowMs: 60 * 1000,
    limit: 20,
  }),
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
      return throwAPIError({
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
