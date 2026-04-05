import { and, eq, inArray } from "drizzle-orm";
import { difference } from "es-toolkit";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { ideasList, ideasListToTone, ideasListToVideoType } from "@/db/schema";
import { updateIdeasListBodySchema } from "@/domains/ideas-lists/schemas/handlers/update-ideas-list/body";
import { updateIdeasListParamsSchema } from "@/domains/ideas-lists/schemas/handlers/update-ideas-list/params";
import {
  type UpdateIdeasListResponse,
  updateIdeasListResponseSchema,
} from "@/domains/ideas-lists/schemas/handlers/update-ideas-list/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { enqueueIdeasListGeneration } from "@/mq/ideas-list-generation/queue";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const updateIdeasListRoute = createHonoApp().basePath(
  "/ideas-lists/:ideasListId",
);

// PATCH /api/v1/ideas-lists/{ideasListId}
updateIdeasListRoute.patch(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "update-ideas-list",
    windowMs: 60 * 1000,
    limit: 3,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.IdeasLists],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Ideas list updated successfully",
        schema: updateIdeasListResponseSchema,
      }),
    },
  }),
  validator("param", updateIdeasListParamsSchema),
  validator("json", updateIdeasListBodySchema),
  async (c) => {
    const { ideasListId } = c.req.valid("param");

    const {
      toneIds: newToneIds,
      videoTypeIds: newVideoTypeIds,
      regenerate: shouldRegenerate,
      ...updateIdeasListParams
    } = c.req.valid("json");

    const user = c.get("user");

    const foundIdeasList = await db.query.ideasList.findFirst({
      where: (ideasList, { eq, and }) => {
        return and(
          eq(ideasList.id, ideasListId),
          eq(ideasList.userId, user.id),
        );
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

    const oldToneIds = foundIdeasList.ideasListToTone.map(
      ({ toneId }) => toneId,
    );

    const createToneIds = newToneIds ? difference(newToneIds, oldToneIds) : [];
    const deleteToneIds = newToneIds ? difference(oldToneIds, newToneIds) : [];

    const oldVideoTypeIds = foundIdeasList.ideasListToVideoType.map(
      ({ videoTypeId }) => videoTypeId,
    );

    const createVideoTypeIds = newVideoTypeIds
      ? difference(newVideoTypeIds, oldVideoTypeIds)
      : [];

    const deleteVideoTypeIds = newVideoTypeIds
      ? difference(oldVideoTypeIds, newVideoTypeIds)
      : [];

    const updatedIdeasList = await db.transaction(async (tx) => {
      const updateLinkingTablePromises: Promise<any>[] = [];

      // Добавляем и удаляем тона, связанные с списком идей
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

      // Добавляем и удаляем типы видео, связанные с списком идей
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

      const [[updatedIdeasList]] = await Promise.all([
        tx
          .update(ideasList)
          .set({
            ...updateIdeasListParams,
            ...(shouldRegenerate ? { status: "pending" } : {}),
          })
          .where(
            and(eq(ideasList.id, ideasListId), eq(ideasList.userId, user.id)),
          )
          .returning(),
        ...updateLinkingTablePromises,
      ]);

      return updatedIdeasList;
    });

    if (shouldRegenerate) {
      await enqueueIdeasListGeneration({
        ideasListId,
        userId: user.id,
      });
    }

    return c.json<UpdateIdeasListResponse>(
      updateIdeasListResponseSchema.parse({
        data: updatedIdeasList,
      }),
    );
  },
);
