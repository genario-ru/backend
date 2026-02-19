import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { ideasList, ideasListToTone, ideasListToVideoType } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { enqueueIdeasListGeneration } from "@/mq/queues/ideas-list-generation-queue";
import { createIdeasListBodySchema } from "@/schemas/entities/ideas-lists/handlers/create-ideas-list/body";
import {
  type CreateIdeasListResponse,
  createIdeasListResponseSchema,
} from "@/schemas/entities/ideas-lists/handlers/create-ideas-list/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const createIdeasListRoute = createHonoApp().basePath("/ideas-lists");

// POST /api/v1/ideas-lists
createIdeasListRoute.post(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.IdeasLists],
    responses: {
      [HTTPStatusCode.Created]: createOpenAPIResponse({
        description: "Ideas list created successfully",
        schema: createIdeasListResponseSchema,
      }),
    },
  }),
  validator("json", createIdeasListBodySchema),
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

    await enqueueIdeasListGeneration({
      ideasListId: createdIdeasList.id,
      userId: user.id,
    });

    return c.json<CreateIdeasListResponse>(
      createIdeasListResponseSchema.parse({
        data: createdIdeasList,
      }),
      HTTPStatusCode.Created,
    );
  },
);
