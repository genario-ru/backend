import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { ideasList, scenario } from "@/db/schema";
import {
  archiveEntitySchema,
  type ArchiveItemWithFilters,
} from "@/domains/archive/schemas/entities/archive-item";
import { DEFAULT_ARCHIVE_SORT } from "@/domains/archive/schemas/entities/archive-sort";
import { getMyArchiveItemsQuerySchema } from "@/domains/archive/schemas/handlers/get-my-archive-items/query";
import {
  type GetMyArchiveItemsResponse,
  getMyArchiveItemsResponseSchema,
} from "@/domains/archive/schemas/handlers/get-my-archive-items/response";
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
import { toTimestamp } from "@/shared/utils/api/dates";
import {
  getNextPage,
  getPreviousPage,
  getTotalPages,
} from "@/shared/utils/api/response-pages";
import { toArray } from "@/shared/utils/api/to-array";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

import {
  ARCHIVE_SORT_MAP,
  DEFAULT_ARCHIVE_SORT_MAP,
} from "../../../filters/get/constants";

export const getMyArchiveItemsRoute =
  createHonoApp().basePath("/archive/items/my");

// GET /api/v1/archive/items/my
getMyArchiveItemsRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-my-archive-items",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
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
      q,
      entity,
      templateIds: rawTemplateIds,
      profileIds: rawProfileIds,
      toneIds: rawToneIds,
      videoTypeIds: rawVideoTypeIds,
      platformIds: rawPlatformIds,
      videoDurationIds: rawVideoDurationIds,
      page = DEFAULT_PAGE,
      perPage = DEFAULT_PER_PAGE,
      sort,
    } = c.req.valid("query");

    const templateIds = toArray(rawTemplateIds);
    const profileIds = toArray(rawProfileIds);
    const toneIds = toArray(rawToneIds);
    const videoTypeIds = toArray(rawVideoTypeIds);
    const platformIds = toArray(rawPlatformIds);
    const videoDurationIds = toArray(rawVideoDurationIds);

    const sortValue = sort ?? DEFAULT_ARCHIVE_SORT;

    const { sortBy, sortOrder } =
      ARCHIVE_SORT_MAP[sortValue] ?? DEFAULT_ARCHIVE_SORT_MAP;

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
              template: true,
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
          sort: sortValue,
        },
      }),
    );
  },
);
