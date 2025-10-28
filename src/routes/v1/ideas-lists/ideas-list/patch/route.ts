import { and, eq, inArray } from "drizzle-orm";
import { difference } from "es-toolkit";

import { db } from "@/db";
import { ideasList, ideasListToTone, ideasListToVideoType } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { updateIdeasListBodySchema } from "@/schemas/entities/ideas-lists/handlers/update-ideas-list/body";
import { updateIdeasListParamsSchema } from "@/schemas/entities/ideas-lists/handlers/update-ideas-list/params";
import {
  type UpdateIdeasListResponse,
  updateIdeasListResponseSchema,
} from "@/schemas/entities/ideas-lists/handlers/update-ideas-list/response";
import { createHonoApp } from "@/utils/create-hono-app";
import { throwAPIError } from "@/utils/throw-api-error";

export const updateIdeasListRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId",
);

// PATCH /api/v1/ideas-lists/{ideasListId}
updateIdeasListRoute.patch("/", sessionMiddleware, async (c) => {
  const { ideasListId } = updateIdeasListParamsSchema.parse(c.req.param());

  const {
    toneIds: newToneIds,
    videoTypeIds: newVideoTypeIds,
    ...updateIdeasListParams
  } = updateIdeasListBodySchema.parse(await c.req.json());

  const user = c.get("user");

  const foundIdeasList = await db.query.ideasList.findFirst({
    where: (ideasList, { eq, and }) => {
      return and(eq(ideasList.id, ideasListId), eq(ideasList.userId, user.id));
    },
    with: {
      ideasListToTone: true,
      ideasListToVideoType: true,
    },
  });

  if (!foundIdeasList) {
    return throwAPIError({
      code: APIErrorCode.NotFound,
      message:
        "Данный список идей не существует или у вас нет возможности редактировать его",
    });
  }

  const updatedIdeasList = await db.transaction(async (tx) => {
    const updateLinkingTablePromises: Promise<any>[] = [];

    // Добавляем и удаляем тона, связанные с списком идей
    if (newToneIds) {
      const oldToneIds = foundIdeasList.ideasListToTone.map(
        ({ toneId }) => toneId,
      );

      const createToneIds = difference(newToneIds, oldToneIds);
      const deleteToneIds = difference(oldToneIds, newToneIds);

      if (createToneIds.length > 0) {
        updateLinkingTablePromises.push(
          tx.insert(ideasListToTone).values(
            createToneIds.map((toneId) => ({
              ideasListId,
              toneId,
            })),
          ),
        );
      }

      if (deleteToneIds.length > 0) {
        updateLinkingTablePromises.push(
          tx
            .delete(ideasListToTone)
            .where(
              and(
                eq(ideasListToTone.ideasListId, ideasListId),
                inArray(ideasListToTone.toneId, deleteToneIds),
              ),
            ),
        );
      }
    }

    // Добавляем и удаляем типы видео, связанные с списком идей
    if (newVideoTypeIds) {
      const oldVideoTypeIds = foundIdeasList.ideasListToVideoType.map(
        ({ videoTypeId }) => videoTypeId,
      );

      const createVideoTypeIds = difference(newVideoTypeIds, oldVideoTypeIds);
      const deleteVideoTypeIds = difference(oldVideoTypeIds, newVideoTypeIds);

      if (createVideoTypeIds.length > 0) {
        updateLinkingTablePromises.push(
          tx.insert(ideasListToVideoType).values(
            createVideoTypeIds.map((videoTypeId) => ({
              ideasListId,
              videoTypeId,
            })),
          ),
        );
      }

      if (deleteVideoTypeIds.length > 0) {
        updateLinkingTablePromises.push(
          tx
            .delete(ideasListToVideoType)
            .where(
              and(
                eq(ideasListToVideoType.ideasListId, ideasListId),
                inArray(ideasListToVideoType.videoTypeId, deleteVideoTypeIds),
              ),
            ),
        );
      }
    }

    const [[updatedIdeasList]] = await Promise.all([
      tx
        .update(ideasList)
        .set(updateIdeasListParams)
        .where(
          and(eq(ideasList.id, ideasListId), eq(ideasList.userId, user.id)),
        )
        .returning(),
      ...updateLinkingTablePromises,
    ]);

    return updatedIdeasList;
  });

  return c.json<UpdateIdeasListResponse>(
    updateIdeasListResponseSchema.parse({
      data: updatedIdeasList,
    }),
  );
});
