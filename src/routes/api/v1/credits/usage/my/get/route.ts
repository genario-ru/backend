import { desc, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { creditsUsage } from "@/db/schema";
import { getMyCreditsUsageQuerySchema } from "@/domains/credits/schemas/handlers/get-my-credits-usage/query";
import {
  type GetMyCreditsUsageResponse,
  getMyCreditsUsageResponseSchema,
} from "@/domains/credits/schemas/handlers/get-my-credits-usage/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
} from "@/shared/constants/api/defaults";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import {
  getNextPage,
  getPreviousPage,
  getTotalPages,
} from "@/shared/utils/api/response-pages";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getMyCreditsUsageRoute =
  createHonoApp().basePath("/credits/usage/my");

// GET /api/v1/credits/usage/my
getMyCreditsUsageRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-my-credits-usage",
    windowMs: 60 * 1000,
    limit: 30,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Credits],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "My credits usage retrieved successfully",
        schema: getMyCreditsUsageResponseSchema,
      }),
    },
  }),
  validator("query", getMyCreditsUsageQuerySchema),
  async (c) => {
    const user = c.get("user");

    const { page = DEFAULT_PAGE, perPage = DEFAULT_PER_PAGE } =
      c.req.valid("query");

    const [totalItems, foundCreditsUsage] = await Promise.all([
      db.$count(creditsUsage, eq(creditsUsage.userId, user.id)),
      db.query.creditsUsage.findMany({
        where: eq(creditsUsage.userId, user.id),
        orderBy: desc(creditsUsage.createdAt),
        limit: perPage,
        offset: (page - 1) * perPage,
        with: {
          batch: true,
        },
      }),
    ]);

    const totalPages = getTotalPages(totalItems, perPage);

    return c.json<GetMyCreditsUsageResponse>(
      getMyCreditsUsageResponseSchema.parse({
        data: foundCreditsUsage,
        meta: {
          previousPage: getPreviousPage(page),
          currentPage: page,
          nextPage: getNextPage(page, totalPages),
          perPage,
          totalItems,
          totalPages,
        },
      }),
    );
  },
);
