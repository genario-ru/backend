import { zValidator } from "@hono/zod-validator";

import { db } from "@/db";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { getScenarioVersionChapterParamsSchema } from "@/schemas/entities/scenarios/handlers/get-scenario-version-chapter/params";
import {
  type GetScenarioVersionChapterResponse,
  getScenarioVersionChapterResponseSchema,
} from "@/schemas/entities/scenarios/handlers/get-scenario-version-chapter/response";
import { createHonoApp } from "@/utils/create-hono-app";
import { throwAPIError } from "@/utils/throw-api-error";

export const getScenarioVersionChapterRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId/versions/:versionId/chapters/:chapterId",
);

// GET /api/v1/scenarios/{scenarioId}/versions/{versionId}/chapters/{chapterId}
getScenarioVersionChapterRoute.get(
  "/",
  sessionMiddleware,
  zValidator("param", getScenarioVersionChapterParamsSchema),
  async (c) => {
    const { scenarioId, versionId, chapterId } = c.req.valid("param");
    const user = c.get("user");

    // Проверяем, что сценарий принадлежит пользователю
    const scenario = await db.query.scenario.findFirst({
      where: (scenario, { eq, and }) =>
        and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)),
    });

    if (!scenario) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Сценарий не найден",
      });
    }

    // Проверяем, что версия принадлежит сценарию
    const version = await db.query.scenarioVersion.findFirst({
      where: (scenarioVersion, { eq, and }) =>
        and(
          eq(scenarioVersion.id, versionId),
          eq(scenarioVersion.scenarioId, scenarioId),
        ),
    });

    if (!version) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Версия сценария не найдена",
      });
    }

    // Получаем chapter со всеми scenes и их components
    const chapter = await db.query.scenarioChapter.findFirst({
      where: (scenarioChapter, { eq, and }) =>
        and(
          eq(scenarioChapter.id, chapterId),
          eq(scenarioChapter.scenarioVersionId, versionId),
        ),
      with: {
        scenes: {
          orderBy: (scenarioScene, { asc }) => [asc(scenarioScene.startTime)],
          with: {
            components: true,
          },
        },
      },
    });

    if (!chapter) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Раздел сценария не найден",
      });
    }

    return c.json<GetScenarioVersionChapterResponse>(
      getScenarioVersionChapterResponseSchema.parse({
        data: chapter,
      }),
    );
  },
);
