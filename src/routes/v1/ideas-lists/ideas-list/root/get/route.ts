import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { getIdeasListParamsSchema } from "@/schemas/entities/ideas-lists/handlers/get-ideas-list/params";
import { getIdeasListQuerySchema } from "@/schemas/entities/ideas-lists/handlers/get-ideas-list/query";
import {
  type GetIdeasListResponse,
  getIdeasListResponseSchema,
} from "@/schemas/entities/ideas-lists/handlers/get-ideas-list/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const getIdeasListRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId",
);

// GET /api/v1/ideas-lists/{ideasListId}
getIdeasListRoute.get(
  "/",
  sessionMiddleware,
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
