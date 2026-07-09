import { validator } from "hono-openapi";

import { db } from "@/db";
import { ideasList, ideasListToTone, ideasListToVideoType } from "@/db/schema";
import { creditsPricing } from "@/domains/credits/constants/credits-pricing";
import { getCreditsBalance } from "@/domains/credits/services/get-credits-balance";
import { createIdeasListBodySchema } from "@/domains/ideas-lists/schemas/handlers/create-ideas-list/body";
import {
  type CreateIdeasListResponse,
  createIdeasListResponseSchema,
} from "@/domains/ideas-lists/schemas/handlers/create-ideas-list/response";
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

export const createIdeasListRoute = createHonoApp().basePath("/ideas-lists");

// POST /api/v1/ideas-lists
createIdeasListRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "create-ideas-list",
    windowMs: 5 * 1000,
    limit: 1,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
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

    const creditsBalance = await getCreditsBalance({ userId: user.id });

    if (creditsBalance < creditsPricing["ideas-list"]) {
      throw throwAPIError({
        code: APIErrorCode.PaymentRequired,
        message: "Недостаточно кредитов для создания списка идей",
      });
    }

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
