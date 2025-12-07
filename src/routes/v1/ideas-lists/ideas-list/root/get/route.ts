import { zValidator } from "@hono/zod-validator";

import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { getIdeasListParamsSchema } from "@/schemas/entities/ideas-lists/handlers/get-ideas-list/params";
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
      200: createOpenAPIResponse({
        description: "Ideas list retrieved successfully",
        schema: getIdeasListResponseSchema,
      }),
    },
  }),
  zValidator("param", getIdeasListParamsSchema),
  async (c) => {
    const { ideasListId } = c.req.valid("param");
    const user = c.get("user");

    const foundIdeasList = await db.query.ideasList.findFirst({
      where: (ideasList, { eq, and }) => {
        return and(
          eq(ideasList.id, ideasListId),
          eq(ideasList.userId, user.id),
        );
      },
      with: {
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
          "Данный список идей не существует или у вас нет возможности просматривать его",
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
