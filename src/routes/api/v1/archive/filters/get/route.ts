import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profile } from "@/db/schema";
import {
  type GetArchiveFiltersResponse,
  getArchiveFiltersResponseSchema,
} from "@/domains/archive/schemas/handlers/get-archive-filters/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

import { ARCHIVE_SORT_OPTIONS } from "./constants";
import { toOptions } from "./utils";

export const getArchiveFiltersRoute =
  createHonoApp().basePath("/archive/filters");

// GET /api/v1/archive/filters
getArchiveFiltersRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-archive-filters",
    windowMs: 1000,
    limit: 3,
  }),
  sessionMiddleware,
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
      db.query.template.findMany({
        orderBy: (template, { asc, desc }) => [
          desc(template.priority),
          asc(template.name),
        ],
      }),
      db.query.profile.findMany({
        where: eq(profile.userId, user.id),
        orderBy: (profile, { desc }) => [desc(profile.createdAt)],
      }),
      db.query.tone.findMany({
        orderBy: (tone, { asc, desc }) => [desc(tone.priority), asc(tone.name)],
      }),
      db.query.videoType.findMany({
        orderBy: (videoType, { asc, desc }) => [
          desc(videoType.priority),
          asc(videoType.name),
        ],
      }),
      db.query.platform.findMany({
        orderBy: (platform, { asc, desc }) => [
          desc(platform.priority),
          asc(platform.name),
        ],
      }),
      db.query.videoDuration.findMany({
        orderBy: (videoDuration, { asc }) => [asc(videoDuration.minSeconds)],
      }),
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
    ];

    return c.json<GetArchiveFiltersResponse>(
      getArchiveFiltersResponseSchema.parse({
        data: archiveFilters,
      }),
    );
  },
);
