import { eq } from "drizzle-orm";

import { db } from "@/db";
import { productionStatus, profile } from "@/db/schema";
import {
  type GetScenariosFiltersResponse,
  getScenariosFiltersResponseSchema,
} from "@/domains/scenarios/schemas/handlers/get-scenarios-filters/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

import { SCENARIOS_SORT_OPTIONS } from "./constants";
import { toOptions } from "./utils";

export const getScenariosFiltersRoute =
  createHonoApp().basePath("/scenarios/filters");

// GET /api/v1/scenarios/filters
getScenariosFiltersRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-scenarios-filters",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenarios filters retrieved successfully",
        schema: getScenariosFiltersResponseSchema,
      }),
    },
  }),
  async (c) => {
    const user = c.get("user");

    const [
      foundTemplates,
      foundProfiles,
      foundTones,
      foundVideoTypes,
      foundPlatforms,
      foundVideoDurations,
      foundProductionStatuses,
    ] = await Promise.all([
      db.query.template.findMany(),
      db.query.profile.findMany({
        where: eq(profile.userId, user.id),
      }),
      db.query.tone.findMany(),
      db.query.videoType.findMany(),
      db.query.platform.findMany(),
      db.query.videoDuration.findMany(),
      db.query.productionStatus.findMany({
        where: eq(productionStatus.forScenario, true),
      }),
    ]);

    const scenariosFilters = [
      {
        slug: "sort",
        name: "Сортировка",
        icon: "arrow-up-down",
        type: "select",
        options: SCENARIOS_SORT_OPTIONS,
      },
      {
        slug: "templateIds",
        name: "Шаблоны",
        icon: "cuboid",
        type: "multiselect",
        options: toOptions(foundTemplates),
      },
      {
        slug: "profileIds",
        name: "Профили",
        icon: "users-round",
        type: "multiselect",
        options: toOptions(foundProfiles),
      },
      {
        slug: "toneIds",
        name: "Тональности",
        icon: "swatch-book",
        type: "multiselect",
        options: toOptions(foundTones),
      },
      {
        slug: "videoTypeIds",
        name: "Типы видео",
        icon: "file-video-camera",
        type: "multiselect",
        options: toOptions(foundVideoTypes),
      },
      {
        slug: "platformIds",
        name: "Платформы",
        icon: "app-window",
        type: "multiselect",
        options: toOptions(foundPlatforms),
      },
      {
        slug: "videoDurationIds",
        name: "Длительность видео",
        icon: "timer",
        type: "multiselect",
        options: toOptions(foundVideoDurations),
      },
      {
        slug: "productionStatusIds",
        name: "Статус продакшена",
        icon: "circle-check",
        type: "multiselect",
        options: toOptions(foundProductionStatuses),
      },
    ];

    return c.json<GetScenariosFiltersResponse>(
      getScenariosFiltersResponseSchema.parse({
        data: scenariosFilters,
      }),
    );
  },
);
