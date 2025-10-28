import { db } from "@/db";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { getIdeasListParamsSchema } from "@/schemas/entities/ideas-lists/handlers/get-ideas-list/params";
import {
  type GetIdeasListResponse,
  getIdeasListResponseSchema,
} from "@/schemas/entities/ideas-lists/handlers/get-ideas-list/response";
import { createHonoApp } from "@/utils/create-hono-app";
import { throwAPIError } from "@/utils/throw-api-error";

export const getIdeasListRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId",
);

// GET /api/v1/ideas-lists/{ideasListId}
getIdeasListRoute.get("/", sessionMiddleware, async (c) => {
  const { ideasListId } = getIdeasListParamsSchema.parse(c.req.param());
  const user = c.get("user");

  const foundIdeasList = await db.query.ideasList.findFirst({
    where: (ideasList, { eq, and }) => {
      return and(eq(ideasList.id, ideasListId), eq(ideasList.userId, user.id));
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
});
