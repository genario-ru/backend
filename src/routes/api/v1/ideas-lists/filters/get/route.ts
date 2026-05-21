import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profile } from "@/db/schema";
import {
  type GetIdeasListsFiltersResponse,
  getIdeasListsFiltersResponseSchema,
} from "@/domains/ideas-lists/schemas/handlers/get-ideas-lists-filters/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

import { IDEAS_LISTS_SORT_OPTIONS } from "./constants";
import { toOptions } from "./utils";

export const getIdeasListsFiltersRoute = createHonoApp().basePath(
  "/ideas-lists/filters",
);

// GET /api/v1/ideas-lists/filters
getIdeasListsFiltersRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-ideas-lists-filters",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.IdeasLists],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Ideas lists filters retrieved successfully",
        schema: getIdeasListsFiltersResponseSchema,
      }),
    },
  }),
  async (c) => {
    const user = c.get("user");

    const [foundTemplates, foundProfiles, foundTones, foundVideoTypes] =
      await Promise.all([
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
          orderBy: (tone, { asc, desc }) => [
            desc(tone.priority),
            asc(tone.name),
          ],
        }),
        db.query.videoType.findMany({
          orderBy: (videoType, { asc, desc }) => [
            desc(videoType.priority),
            asc(videoType.name),
          ],
        }),
      ]);

    const ideasListsFilters = [
      {
        slug: "sort",
        name: "Сортировка",
        icon: "arrow-up-down",
        type: "select",
        options: IDEAS_LISTS_SORT_OPTIONS,
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
    ];

    return c.json<GetIdeasListsFiltersResponse>(
      getIdeasListsFiltersResponseSchema.parse({
        data: ideasListsFilters,
      }),
    );
  },
);
