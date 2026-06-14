import { count, eq } from "drizzle-orm";

import { db } from "@/db";
import { ideasList, profile, scenario, scenarioMetadata } from "@/db/schema";
import {
  type GetOnboardingResponse,
  getOnboardingResponseSchema,
  type OnboardingItem,
} from "@/domains/onboarding/schemas/handlers/get-onboarding/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getOnboardingRoute = createHonoApp().basePath("/onboarding");

// GET /api/v1/onboarding
getOnboardingRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-onboarding",
    windowMs: 1000,
    limit: 2,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Onboarding],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Onboarding retrieved successfully",
        schema: getOnboardingResponseSchema,
      }),
    },
  }),
  async (c) => {
    const user = c.get("user");

    const [
      [{ totalItems: profilesCount }],
      [{ totalItems: readyIdeasListsCount }],
      [{ totalItems: scenariosCount }],
      [{ totalItems: readyMetadataCount }],
    ] = await Promise.all([
      db
        .select({ totalItems: count() })
        .from(profile)
        .where(eq(profile.userId, user.id)),
      db
        .select({ totalItems: count() })
        .from(ideasList)
        .where(eq(ideasList.userId, user.id)),
      db
        .select({ totalItems: count() })
        .from(scenario)
        .where(eq(scenario.userId, user.id)),
      db
        .select({ totalItems: count() })
        .from(scenarioMetadata)
        .innerJoin(scenario, eq(scenarioMetadata.scenarioId, scenario.id))
        .where(eq(scenario.userId, user.id)),
    ]);

    const hasProfiles = profilesCount > 0;
    const hasReadyIdeasLists = readyIdeasListsCount > 0;
    const hasScenarios = scenariosCount > 0;
    const hasReadyMetadata = readyMetadataCount > 0;

    const items: OnboardingItem[] = [
      {
        type: "profile",
        status: hasProfiles ? "completed" : "pending",
        title: "Создайте первый профиль",
        description:
          "Импортируйте канал с RuTube или YouTube или вручную опишите автора, нишу и аудиторию, чтобы Genario точнее подбирал идеи.",
      },
      {
        type: "ideas-list",
        status: !hasProfiles
          ? "locked"
          : hasReadyIdeasLists
            ? "completed"
            : "pending",
        title: "Сгенерируйте первый список идей",
        description:
          "Получите подборку тем для видео на основе профиля и выбранного шаблона.",
      },
      {
        type: "scenario",
        status: !hasReadyIdeasLists
          ? "locked"
          : hasScenarios
            ? "completed"
            : "pending",
        title: "Создайте первый сценарий",
        description:
          "Превратите идею в структуру ролика со сценами, главами и подсказками.",
      },
      {
        type: "metadata",
        status: !hasScenarios
          ? "locked"
          : hasReadyMetadata
            ? "completed"
            : "pending",
        title: "Сгенерируйте метаданные",
        description:
          "Подготовьте заголовки, описания и теги под платформы публикации.",
      },
    ];

    return c.json<GetOnboardingResponse>(
      getOnboardingResponseSchema.parse({
        icon: "rocket",
        title: "Быстрый старт",
        description:
          "Пройдите основные шаги, чтобы подготовить первый ролик в Genario.",
        items,
      }),
    );
  },
);
