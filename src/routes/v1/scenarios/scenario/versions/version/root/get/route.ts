import { zValidator } from "@hono/zod-validator";

import { db } from "@/db";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { getScenarioVersionParamsSchema } from "@/schemas/entities/scenarios/handlers/get-scenario-version/params";
import {
  type GetScenarioVersionResponse,
  getScenarioVersionResponseSchema,
} from "@/schemas/entities/scenarios/handlers/get-scenario-version/response";
import { createHonoApp } from "@/utils/create-hono-app";
import { throwAPIError } from "@/utils/throw-api-error";

export const getScenarioVersionRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId/versions/:versionId",
);

// GET /api/v1/scenarios/{scenarioId}/versions/{versionId}
getScenarioVersionRoute.get(
  "/",
  sessionMiddleware,
  zValidator("param", getScenarioVersionParamsSchema),
  async (c) => {
    const { scenarioId, versionId } = c.req.valid("param");
    const user = c.get("user");

    // Проверяем, что сценарий принадлежит пользователю и загружаем связанные данные
    const scenario = await db.query.scenario.findFirst({
      where: (scenario, { eq, and }) =>
        and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)),
      with: {
        profile: true,
        platform: true,
        videoType: true,
        videoDuration: true,
        scenarioToTone: {
          with: { tone: true },
        },
      },
    });

    if (!scenario) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный сценарий не существует или у вас нет возможности просматривать его",
      });
    }

    // Получаем версию с разделами
    const version = await db.query.scenarioVersion.findFirst({
      where: (scenarioVersion, { eq, and }) =>
        and(
          eq(scenarioVersion.id, versionId),
          eq(scenarioVersion.scenarioId, scenarioId),
        ),
      with: {
        chapters: {
          orderBy: (scenarioChapter, { asc }) => [
            asc(scenarioChapter.startTime),
          ],
        },
      },
    });

    if (!version) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Версия сценария не найдена",
      });
    }

    const { scenarioToTone, ...scenarioData } = scenario;

    return c.json<GetScenarioVersionResponse>(
      getScenarioVersionResponseSchema.parse({
        data: {
          ...version,
          profile: scenarioData.profile,
          platform: scenarioData.platform,
          videoType: scenarioData.videoType,
          videoDuration: scenarioData.videoDuration,
          tones: scenarioToTone.map((item) => item.tone),
          scenarioChapters: version.chapters,
        },
      }),
    );
  },
);
