import { eq } from "drizzle-orm";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
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

export const getArchiveFiltersRoute =
  createHonoApp().basePath("/archive/filters");

type OptionSource = { id: string; name?: string | null; slug?: string | null };

const toOptions = (items: OptionSource[]) =>
  items.map((item) => ({
    label: item.name ?? item.slug ?? item.id,
    value: item.id,
  }));

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
      sortBy: {
        name: "Сортировка по дате",
        type: "select",
        options: [
          { label: "Дата создания", value: "createdAt" },
          { label: "Дата обновления", value: "updatedAt" },
        ],
      },
      sortOrder: {
        name: "Порядок сортировки",
        type: "select",
        options: [
          { label: "По убыванию", value: "desc" },
          { label: "По возрастанию", value: "asc" },
        ],
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
