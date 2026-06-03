import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { scenario, scenarioToPlatform, scenarioToTone } from "@/db/schema";
import { getMyScenariosQuerySchema } from "@/domains/scenarios/schemas/handlers/get-my-scenarios/query";
import {
  type GetMyScenariosResponse,
  getMyScenariosResponseSchema,
} from "@/domains/scenarios/schemas/handlers/get-my-scenarios/response";
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
  DEFAULT_SCENARIOS_SORT_MAP,
  SCENARIOS_SORT_MAP,
} from "../../filters/get/constants";

export const getMyScenariosRoute = createHonoApp().basePath("/scenarios");

// GET /api/v1/scenarios
getMyScenariosRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-my-scenarios",
    windowMs: 60 * 1000,
    limit: 30,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenarios retrieved successfully",
        schema: getMyScenariosResponseSchema,
      }),
    },
  }),
  validator("query", getMyScenariosQuerySchema),
  async (c) => {
    const user = c.get("user");

    const {
      q,
      templateIds: rawTemplateIds,
      profileIds: rawProfileIds,
      toneIds: rawToneIds,
      videoTypeIds: rawVideoTypeIds,
      platformIds: rawPlatformIds,
      videoDurationIds: rawVideoDurationIds,
      productionStatusIds: rawProductionStatusIds,
      scheduledStartAtFrom,
      scheduledStartAtTo,
      isScheduled,
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
    const productionStatusIds = toArray(rawProductionStatusIds);

    const sortValue = sort ?? "createdAtDesc";

    const { sortBy, sortOrder } =
      SCENARIOS_SORT_MAP[sortValue] ?? DEFAULT_SCENARIOS_SORT_MAP;

    const whereConditions = [eq(scenario.userId, user.id)];

    if (q) {
      const ilikeNameOrDescription = or(
        ilike(scenario.name, `%${q}%`),
        ilike(scenario.description, `%${q}%`),
      );

      if (ilikeNameOrDescription) {
        whereConditions.push(ilikeNameOrDescription);
      }
    }

    if (templateIds && templateIds.length > 0) {
      whereConditions.push(inArray(scenario.templateId, templateIds));
    }

    if (profileIds && profileIds.length > 0) {
      whereConditions.push(inArray(scenario.profileId, profileIds));
    }

    if (productionStatusIds && productionStatusIds.length > 0) {
      whereConditions.push(
        inArray(scenario.productionStatusId, productionStatusIds),
      );
    }

    if (videoTypeIds && videoTypeIds.length > 0) {
      whereConditions.push(inArray(scenario.videoTypeId, videoTypeIds));
    }

    if (videoDurationIds && videoDurationIds.length > 0) {
      whereConditions.push(inArray(scenario.videoDurationId, videoDurationIds));
    }

    if (toneIds && toneIds.length > 0) {
      whereConditions.push(
        inArray(
          scenario.id,
          db
            .select({ id: scenarioToTone.scenarioId })
            .from(scenarioToTone)
            .where(inArray(scenarioToTone.toneId, toneIds)),
        ),
      );
    }

    if (platformIds && platformIds.length > 0) {
      whereConditions.push(
        inArray(
          scenario.id,
          db
            .select({ id: scenarioToPlatform.scenarioId })
            .from(scenarioToPlatform)
            .where(inArray(scenarioToPlatform.platformId, platformIds)),
        ),
      );
    }

    if (scheduledStartAtFrom) {
      whereConditions.push(
        gte(scenario.scheduledStartAt, scheduledStartAtFrom),
      );
    }

    if (scheduledStartAtTo) {
      whereConditions.push(lte(scenario.scheduledStartAt, scheduledStartAtTo));
    }

    if (isScheduled === true) {
      whereConditions.push(isNotNull(scenario.scheduledStartAt));
    } else if (isScheduled === false) {
      whereConditions.push(isNull(scenario.scheduledStartAt));
    }

    let orderBy;

    if (sortBy === "scheduledStartAt") {
      orderBy =
        sortOrder === "asc"
          ? sql`${scenario.scheduledStartAt} asc nulls last`
          : sql`${scenario.scheduledStartAt} desc nulls last`;
    } else if (sortOrder === "asc") {
      orderBy = asc(scenario[sortBy]);
    } else {
      orderBy = desc(scenario[sortBy]);
    }

    const whereClause = and(...whereConditions);

    const [foundScenarios, [{ totalItems }]] = await Promise.all([
      db.query.scenario.findMany({
        where: whereClause,
        orderBy,
        limit: perPage,
        offset: (page - 1) * perPage,
        with: {
          profile: true,
          template: true,
          videoType: true,
          videoDuration: true,
          productionStatus: true,
          scenarioToPlatform: {
            with: { platform: true },
          },
          scenarioToTone: {
            with: { tone: true },
          },
        },
      }),
      db.select({ totalItems: count() }).from(scenario).where(whereClause),
    ]);

    const preparedScenarios = foundScenarios.map((foundScenario) => {
      const { scenarioToPlatform, scenarioToTone, ...scenarioData } =
        foundScenario;

      return {
        ...scenarioData,
        platforms: scenarioToPlatform.map(
          (scenarioPlatform) => scenarioPlatform.platform,
        ),
        tones: scenarioToTone.map((scenarioTone) => scenarioTone.tone),
      };
    });

    const totalPages = getTotalPages(totalItems, perPage);

    return c.json<GetMyScenariosResponse>(
      getMyScenariosResponseSchema.parse({
        data: preparedScenarios,
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
