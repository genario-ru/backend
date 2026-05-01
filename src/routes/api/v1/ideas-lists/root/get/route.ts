import { and, asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { ideasList, ideasListToTone, ideasListToVideoType } from "@/db/schema";
import { getMyIdeasListsQuerySchema } from "@/domains/ideas-lists/schemas/handlers/get-my-ideas-lists/query";
import {
  type GetMyIdeasListsResponse,
  getMyIdeasListsResponseSchema,
} from "@/domains/ideas-lists/schemas/handlers/get-my-ideas-lists/response";
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
import { toArray } from "@/shared/utils/api/to-array";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

import {
  DEFAULT_IDEAS_LISTS_SORT_MAP,
  IDEAS_LISTS_SORT_MAP,
} from "../../filters/get/constants";

export const getMyIdeasListsRoute = createHonoApp().basePath("/ideas-lists");

// GET /api/v1/ideas-lists
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
      q,
      templateIds: rawTemplateIds,
      profileIds: rawProfileIds,
      toneIds: rawToneIds,
      videoTypeIds: rawVideoTypeIds,
      page = DEFAULT_PAGE,
      perPage = DEFAULT_PER_PAGE,
      sort,
    } = c.req.valid("query");

    const templateIds = toArray(rawTemplateIds);
    const profileIds = toArray(rawProfileIds);
    const toneIds = toArray(rawToneIds);
    const videoTypeIds = toArray(rawVideoTypeIds);

    const sortValue = sort ?? "createdAtDesc";

    const { sortBy, sortOrder } =
      IDEAS_LISTS_SORT_MAP[sortValue] ?? DEFAULT_IDEAS_LISTS_SORT_MAP;

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

    if (templateIds && templateIds.length > 0) {
      whereConditions.push(inArray(ideasList.templateId, templateIds));
    }

    if (profileIds && profileIds.length > 0) {
      whereConditions.push(inArray(ideasList.profileId, profileIds));
    }

    if (toneIds && toneIds.length > 0) {
      whereConditions.push(
        inArray(
          ideasList.id,
          db
            .select({ id: ideasListToTone.ideasListId })
            .from(ideasListToTone)
            .where(inArray(ideasListToTone.toneId, toneIds)),
        ),
      );
    }

    if (videoTypeIds && videoTypeIds.length > 0) {
      whereConditions.push(
        inArray(
          ideasList.id,
          db
            .select({ id: ideasListToVideoType.ideasListId })
            .from(ideasListToVideoType)
            .where(inArray(ideasListToVideoType.videoTypeId, videoTypeIds)),
        ),
      );
    }

    const orderBy =
      sortOrder === "asc" ? asc(ideasList[sortBy]) : desc(ideasList[sortBy]);

    const whereClause = and(...whereConditions);

    const [foundIdeasLists, [{ totalItems }]] = await Promise.all([
      db.query.ideasList.findMany({
        where: whereClause,
        orderBy,
        limit: perPage,
        offset: (page - 1) * perPage,
        with: {
          profile: true,
          template: true,
          ideasListToTone: { with: { tone: true } },
          ideasListToVideoType: { with: { videoType: true } },
        },
      }),
      db.select({ totalItems: count() }).from(ideasList).where(whereClause),
    ]);

    const preparedIdeasLists = foundIdeasLists.map((foundIdeasList) => {
      const { ideasListToTone, ideasListToVideoType, ...ideasListData } =
        foundIdeasList;

      return {
        ...ideasListData,
        tones: ideasListToTone.map((relation) => relation.tone),
        videoTypes: ideasListToVideoType.map((relation) => relation.videoType),
      };
    });

    const totalPages = getTotalPages(totalItems, perPage);

    return c.json<GetMyIdeasListsResponse>(
      getMyIdeasListsResponseSchema.parse({
        data: preparedIdeasLists,
        meta: {
          q,
          previousPage: getPreviousPage(page),
          currentPage: page,
          nextPage: getNextPage(page, totalPages),
          perPage,
          totalItems,
          totalPages,
          sort: sortValue,
        },
      }),
    );
  },
);
