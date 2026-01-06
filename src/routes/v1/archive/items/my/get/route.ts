import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { validator } from "hono-openapi";

import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
} from "@/constants/api/defaults";
import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { ideasList, scenario } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { archiveEntitySchema } from "@/schemas/entities/archive/entities/archive-item";
import { getMyArchiveItemsQuerySchema } from "@/schemas/entities/archive/handlers/get-my-archive-items/query";
import {
  type GetMyArchiveItemsResponse,
  getMyArchiveItemsResponseSchema,
} from "@/schemas/entities/archive/handlers/get-my-archive-items/response";
import { toTimestamp } from "@/utils/api/dates";
import {
  getNextPage,
  getPreviousPage,
  getTotalPages,
} from "@/utils/api/response-pages";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const getMyArchiveItemsRoute =
  createHonoApp().basePath("/archive/items/my");

// GET /api/v1/archive/items/my
getMyArchiveItemsRoute.get(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Archive],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Archive items retrieved successfully",
        schema: getMyArchiveItemsResponseSchema,
      }),
    },
  }),
  validator("query", getMyArchiveItemsQuerySchema),
  async (c) => {
    const user = c.get("user");

    const {
      entity,
      templateIds,
      profileIds,
      q,
      page = DEFAULT_PAGE,
      perPage = DEFAULT_PER_PAGE,
      sortBy = DEFAULT_SORT_BY,
      sortOrder = DEFAULT_SORT_ORDER,
    } = c.req.valid("query");

    const ideasListsWhereConditions = [eq(ideasList.userId, user.id)];
    const scenariosWhereConditions = [eq(scenario.userId, user.id)];

    if (q) {
      const ideasListsIlikeNameOrDescription = or(
        ilike(ideasList.name, `%${q}%`),
        ilike(ideasList.description, `%${q}%`),
      );

      if (ideasListsIlikeNameOrDescription) {
        ideasListsWhereConditions.push(ideasListsIlikeNameOrDescription);
      }

      const scenariosIlikeNameOrDescription = or(
        ilike(scenario.name, `%${q}%`),
        ilike(scenario.description, `%${q}%`),
      );

      if (scenariosIlikeNameOrDescription) {
        scenariosWhereConditions.push(scenariosIlikeNameOrDescription);
      }
    }

    if (templateIds && templateIds.length > 0) {
      ideasListsWhereConditions.push(
        inArray(ideasList.templateId, templateIds),
      );

      scenariosWhereConditions.push(inArray(scenario.templateId, templateIds));
    }

    if (profileIds && profileIds.length > 0) {
      ideasListsWhereConditions.push(inArray(ideasList.profileId, profileIds));
      scenariosWhereConditions.push(inArray(scenario.profileId, profileIds));
    }

    let orderByConditions = undefined;

    if (sortOrder === "asc") {
      orderByConditions = asc(ideasList[sortBy]);
      orderByConditions = asc(scenario[sortBy]);
    } else if (sortOrder === "desc") {
      orderByConditions = desc(ideasList[sortBy]);
      orderByConditions = desc(scenario[sortBy]);
    }

    const [foundIdeasLists, foundScenarios] = await Promise.all([
      db.query.ideasList.findMany({
        where: and(...ideasListsWhereConditions),
        orderBy: orderByConditions,
        with: {
          profile: true,
          ideasListToTone: {
            with: { tone: true },
          },
          ideasListToVideoType: {
            with: { videoType: true },
          },
        },
      }),
      db.query.scenario.findMany({
        where: and(...scenariosWhereConditions),
        orderBy: orderByConditions,
        with: {
          profile: true,
        },
      }),
    ]);

    const totalItems = foundIdeasLists.length + foundScenarios.length;
    const totalPages = getTotalPages(totalItems, perPage);

    const preparedIdeasLists = foundIdeasLists.map((ideasList) => ({
      entity: archiveEntitySchema.enum.ideasList,
      data: {
        ...ideasList,
        tones: ideasList.ideasListToTone.map(
          (ideasListToTone) => ideasListToTone.tone,
        ),
        videoTypes: ideasList.ideasListToVideoType.map(
          (ideasListToVideoType) => ideasListToVideoType.videoType,
        ),
      },
    }));

    const preparedScenarios = foundScenarios.map((scenario) => ({
      entity: archiveEntitySchema.enum.scenario,
      data: scenario,
    }));

    const sortedArchiveItems = [
      ...preparedIdeasLists,
      ...preparedScenarios,
    ].sort((a, b) => {
      return toTimestamp(b.data.createdAt) - toTimestamp(a.data.createdAt);
    });

    const currentPageArchiveItems = sortedArchiveItems.slice(
      (page - 1) * perPage,
      page * perPage,
    );

    return c.json<GetMyArchiveItemsResponse>(
      getMyArchiveItemsResponseSchema.parse({
        data: currentPageArchiveItems,
        meta: {
          entity,
          ideasListsTotalItems: foundIdeasLists.length,
          scenariosTotalItems: foundScenarios.length,
          q,
          previousPage: getPreviousPage(page),
          currentPage: page,
          nextPage: getNextPage(page, totalPages),
          perPage,
          totalItems,
          totalPages,
          sortBy,
          sortOrder,
        },
      }),
    );
  },
);
