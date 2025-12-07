import { zValidator } from "@hono/zod-validator";

import { db } from "@/db";
import { ideasList, ideasListToTone, ideasListToVideoType } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { createIdeasListBodySchema } from "@/schemas/entities/ideas-lists/handlers/create-ideas-list/body";
import {
  type CreateIdeasListResponse,
  createIdeasListResponseSchema,
} from "@/schemas/entities/ideas-lists/handlers/create-ideas-list/response";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const createIdeasListRoute = createHonoApp().basePath("/ideas-lists");

// POST /api/v1/ideas-lists
createIdeasListRoute.post(
  "/",
  sessionMiddleware,
  zValidator("json", createIdeasListBodySchema),
  async (c) => {
    const { toneIds, videoTypeIds, ...createIdeasListParams } =
      c.req.valid("json");

    const user = c.get("user");

    const createdIdeasList = await db.transaction(async (tx) => {
      const [createdIdeasList] = await tx
        .insert(ideasList)
        .values({
          userId: user.id,
          ...createIdeasListParams,
        })
        .returning();

      if (toneIds && toneIds.length > 0) {
        await tx.insert(ideasListToTone).values(
          toneIds.map((toneId) => ({
            ideasListId: createdIdeasList.id,
            toneId,
          })),
        );
      }

      if (videoTypeIds && videoTypeIds.length > 0) {
        await tx.insert(ideasListToVideoType).values(
          videoTypeIds.map((videoTypeId) => ({
            ideasListId: createdIdeasList.id,
            videoTypeId,
          })),
        );
      }

      return createdIdeasList;
    });

    return c.json<CreateIdeasListResponse>(
      createIdeasListResponseSchema.parse({
        data: createdIdeasList,
      }),
    );
  },
);
