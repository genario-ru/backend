import { eq } from "drizzle-orm";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { ARCHIVE_SORT_OPTIONS } from "@/constants/entities/archive/sort";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { archiveEntitySchema } from "@/schemas/entities/archive/entities/archive-item";
import {
  type GetArchiveFiltersResponse,
  getArchiveFiltersResponseSchema,
} from "@/schemas/entities/archive/handlers/get-archive-filters/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

import { toOptions } from "./utils";

export const getArchiveFiltersRoute =
  createHonoApp().basePath("/archive/filters");

// GET /api/v1/archive/filters
getArchiveFiltersRoute.get(
  "/",
  sessionMiddleware,
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

    const archiveFilters = {
      entity: {
        name: "Тип сущности",
        type: "select",
        options: [
          {
            label: "Списки идей",
            value: archiveEntitySchema.enum.ideasList,
          },
          {
            label: "Сценарии",
            value: archiveEntitySchema.enum.scenario,
          },
        ],
      },
      sort: {
        name: "Сортировка",
        type: "select",
        options: ARCHIVE_SORT_OPTIONS,
      },
      templateIds: {
        name: "Шаблоны",
        type: "multiselect",
        options: toOptions(foundTemplates),
      },
      profileIds: {
        name: "Профили",
        type: "multiselect",
        options: toOptions(foundProfiles),
      },
      toneIds: {
        name: "Тональности",
        type: "multiselect",
        options: toOptions(foundTones),
      },
      videoTypeIds: {
        name: "Типы видео",
        type: "multiselect",
        options: toOptions(foundVideoTypes),
      },
      platformIds: {
        name: "Платформы",
        type: "multiselect",
        options: toOptions(foundPlatforms),
      },
      videoDurationIds: {
        name: "Длительность видео",
        type: "multiselect",
        options: toOptions(foundVideoDurations),
      },
    };

    return c.json<GetArchiveFiltersResponse>(
      getArchiveFiltersResponseSchema.parse({
        data: archiveFilters,
      }),
    );
  },
);
