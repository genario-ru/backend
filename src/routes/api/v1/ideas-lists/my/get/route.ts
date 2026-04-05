import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { ideasList } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { getMyIdeasListsQuerySchema } from "@/schemas/domains/ideas-lists/handlers/get-my-ideas-lists/query";
import {
  type GetMyIdeasListsResponse,
  getMyIdeasListsResponseSchema,
} from "@/schemas/domains/ideas-lists/handlers/get-my-ideas-lists/response";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;

export const getMyIdeasListsRoute = createHonoApp().basePath("/ideas-lists/my");

// GET /api/v1/ideas-lists/my
getMyIdeasListsRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-my-ideas-lists",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.IdeasLists],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Ideas lists retrieved successfully",
        schema: getMyIdeasListsResponseSchema,
      }),
    },
  }),
  validator("query", getMyIdeasListsQuerySchema),
  async (c) => {
    const user = c.get("user");

    const {
      profileId,
      q,
      page = DEFAULT_PAGE,
      perPage = DEFAULT_PER_PAGE,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = c.req.valid("query");

    const whereConditions = [eq(ideasList.userId, user.id)];

    if (q) {
      const ilikeNameOrDescription = or(
        ilike(ideasList.name, `%${q}%`),
        ilike(ideasList.description, `%${q}%`),
      );

      if (ilikeNameOrDescription) {
        whereConditions.push(ilikeNameOrDescription);
      }
    }

    if (profileId) {
      whereConditions.push(eq(ideasList.profileId, profileId));
    }

    let orderByConditions = undefined;

    if (sortOrder === "asc") {
      orderByConditions = asc(ideasList[sortBy]);
    } else if (sortOrder === "desc") {
      orderByConditions = desc(ideasList[sortBy]);
    }

    const [foundIdeasListsTotalCount, foundIdeasLists] = await Promise.all([
      db.$count(ideasList, and(...whereConditions)),
      db.query.ideasList.findMany({
        where: and(...whereConditions),
        orderBy: orderByConditions,
        with: {
          profile: true,
          template: true,
          ideasListToTone: {
            with: { tone: true },
          },
          ideasListToVideoType: {
            with: { videoType: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(foundIdeasListsTotalCount / perPage);
    const previousPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    return c.json<GetMyIdeasListsResponse>(
      getMyIdeasListsResponseSchema.parse({
        data: foundIdeasLists.map((ideasList) => ({
          ...ideasList,
          tones: ideasList.ideasListToTone.map(
            (ideasListToTone) => ideasListToTone.tone,
          ),
          videoTypes: ideasList.ideasListToVideoType.map(
            (ideasListToVideoType) => ideasListToVideoType.videoType,
          ),
        })),
        meta: {
          profileId,
          q,
          previousPage,
          currentPage: page,
          nextPage,
          perPage,
          totalItems: foundIdeasListsTotalCount,
          totalPages,
          sortBy,
          sortOrder,
        },
      }),
    );
  },
);
