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
import { type ArchiveItemWithFilters } from "@/schemas/entities/archive/entities/archive-item";
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
      toneIds,
      videoTypeIds,
      platformIds,
      videoDurationIds,
      q,
      page = DEFAULT_PAGE,
      perPage = DEFAULT_PER_PAGE,
      sortBy = DEFAULT_SORT_BY,
      sortOrder = DEFAULT_SORT_ORDER,
    } = c.req.valid("query");

    const shouldLoadIdeasLists =
      !entity || entity === archiveEntitySchema.enum.ideasList;
    const shouldLoadScenarios =
      !entity || entity === archiveEntitySchema.enum.scenario;

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

    let ideasListOrderBy = undefined;
    let scenarioOrderBy = undefined;

    if (sortOrder === "asc") {
      ideasListOrderBy = asc(ideasList[sortBy]);
      scenarioOrderBy = asc(scenario[sortBy]);
    } else if (sortOrder === "desc") {
      ideasListOrderBy = desc(ideasList[sortBy]);
      scenarioOrderBy = desc(scenario[sortBy]);
    }

    const [foundIdeasLists, foundScenarios] = await Promise.all([
      shouldLoadIdeasLists
        ? db.query.ideasList.findMany({
            where: and(...ideasListsWhereConditions),
            orderBy: ideasListOrderBy,
            with: {
              profile: true,
              ideasListToTone: {
                with: { tone: true },
              },
              ideasListToVideoType: {
                with: { videoType: true },
              },
            },
          })
        : Promise.resolve([]),
      shouldLoadScenarios
        ? db.query.scenario.findMany({
            where: and(...scenariosWhereConditions),
            orderBy: scenarioOrderBy,
            with: {
              profile: true,
              template: true,
              platform: true,
              videoType: true,
              videoDuration: true,
              scenarioToTone: {
                with: { tone: true },
              },
            },
          })
        : Promise.resolve([]),
    ]);

    const preparedIdeasLists = foundIdeasLists.map((ideasList) => {
      const { ideasListToTone, ideasListToVideoType, ...ideasListData } =
        ideasList;

      return {
        entity: archiveEntitySchema.enum.ideasList,
        data: {
          ...ideasListData,
          tones: ideasListToTone.map((ideasListToTone) => ideasListToTone.tone),
          videoTypes: ideasListToVideoType.map(
            (ideasListToVideoType) => ideasListToVideoType.videoType,
          ),
        },
      };
    });

    const preparedScenarios = foundScenarios.map((scenario) => {
      const { scenarioToTone, ...scenarioData } = scenario;

      return {
        entity: archiveEntitySchema.enum.scenario,
        data: {
          ...scenarioData,
          tones: scenarioToTone.map((scenarioTone) => scenarioTone.tone),
        },
      };
    });

    const toneIdsSet = toneIds ? new Set(toneIds) : undefined;
    const videoTypeIdsSet = videoTypeIds ? new Set(videoTypeIds) : undefined;
    const platformIdsSet = platformIds ? new Set(platformIds) : undefined;
    const videoDurationIdsSet = videoDurationIds
      ? new Set(videoDurationIds)
      : undefined;

    const filterBySelectedOptions = (archiveItem: ArchiveItemWithFilters) => {
      const { data, entity: archiveItemEntity } = archiveItem;

      if (toneIdsSet) {
        const archiveItemToneIds = data.tones?.map((tone) => tone.id) ?? [];

        if (!archiveItemToneIds.some((toneId) => toneIdsSet.has(toneId))) {
          return false;
        }
      }

      if (videoTypeIdsSet) {
        if (archiveItemEntity === archiveEntitySchema.enum.ideasList) {
          const archiveItemVideoTypeIds =
            data.videoTypes?.map((videoType) => videoType.id) ?? [];

          if (
            !archiveItemVideoTypeIds.some((videoTypeId) =>
              videoTypeIdsSet.has(videoTypeId),
            )
          ) {
            return false;
          }
        }

        if (archiveItemEntity === archiveEntitySchema.enum.scenario) {
          const archiveItemVideoTypeId = data.videoType?.id;

          if (
            !archiveItemVideoTypeId ||
            !videoTypeIdsSet.has(archiveItemVideoTypeId)
          ) {
            return false;
          }
        }
      }

      if (platformIdsSet) {
        if (archiveItemEntity !== archiveEntitySchema.enum.scenario) {
          return false;
        }

        const archiveItemPlatformId = data.platform?.id;

        if (
          !archiveItemPlatformId ||
          !platformIdsSet.has(archiveItemPlatformId)
        ) {
          return false;
        }
      }

      if (videoDurationIdsSet) {
        if (archiveItemEntity !== archiveEntitySchema.enum.scenario) {
          return false;
        }

        const archiveItemVideoDurationId = data.videoDuration?.id;

        if (
          !archiveItemVideoDurationId ||
          !videoDurationIdsSet.has(archiveItemVideoDurationId)
        ) {
          return false;
        }
      }

      return true;
    };

    const filteredIdeasLists = preparedIdeasLists.filter(
      filterBySelectedOptions,
    );
    const filteredScenarios = preparedScenarios.filter(filterBySelectedOptions);

    const filteredArchiveItems = [...filteredIdeasLists, ...filteredScenarios];

    const sortedArchiveItems = filteredArchiveItems.sort((a, b) => {
      const aTimestamp = toTimestamp(a.data[sortBy] ?? a.data.createdAt);
      const bTimestamp = toTimestamp(b.data[sortBy] ?? b.data.createdAt);

      if (sortOrder === "asc") {
        return aTimestamp - bTimestamp;
      }

      return bTimestamp - aTimestamp;
    });

    const totalItems = sortedArchiveItems.length;
    const totalPages = getTotalPages(totalItems, perPage);

    const currentPageArchiveItems = sortedArchiveItems.slice(
      (page - 1) * perPage,
      page * perPage,
    );

    return c.json<GetMyArchiveItemsResponse>(
      getMyArchiveItemsResponseSchema.parse({
        data: currentPageArchiveItems,
        meta: {
          entity,
          ideasListsTotalItems: filteredIdeasLists.length,
          scenariosTotalItems: filteredScenarios.length,
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
