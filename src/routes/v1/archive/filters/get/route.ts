import { eq } from "drizzle-orm";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import {
  type GetArchiveFiltersResponse,
  getArchiveFiltersResponseSchema,
} from "@/schemas/entities/archive/handlers/get-archive-filters/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

import { ARCHIVE_SORT_OPTIONS } from "./constants";
import { toOptions } from "./utils";

export const getArchiveFiltersRoute =
  createHonoApp().basePath("/archive/filters");

// GET /api/v1/archive/filters
getArchiveFiltersRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-archive-filters",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Archive],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Archive filters retrieved successfully",
        schema: getArchiveFiltersResponseSchema,
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
    ] = await Promise.all([
      db.query.template.findMany(),
      db.query.profile.findMany({
        where: eq(profile.userId, user.id),
      }),
      db.query.tone.findMany(),
      db.query.videoType.findMany(),
      db.query.platform.findMany(),
      db.query.videoDuration.findMany(),
    ]);

    const archiveFilters = [
      {
        slug: "entity",
        name: "Тип сущности",
        icon: "shapes",
        type: "select",
        options: [
          {
            label: "Списки идей",
            value: "ideasList",
          },
          {
            label: "Сценарии",
            value: "scenario",
          },
        ],
      },
      {
        slug: "sort",
        name: "Сортировка",
        icon: "arrow-up-down",
        type: "select",
        options: ARCHIVE_SORT_OPTIONS,
      },
      {
        slug: "templateIds",
        name: "Шаблоны",
        icon: "book-dashed",
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
        icon: "linkedin",
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
    ];

    return c.json<GetArchiveFiltersResponse>(
      getArchiveFiltersResponseSchema.parse({
        data: archiveFilters,
      }),
    );
  },
);
