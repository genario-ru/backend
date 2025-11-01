import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { scenarioScene } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { updateScenarioVersionSceneBodySchema } from "@/schemas/entities/scenarios/handlers/update-scenario-version-scene/body";
import { updateScenarioVersionSceneParamsSchema } from "@/schemas/entities/scenarios/handlers/update-scenario-version-scene/params";
import {
  type UpdateScenarioVersionSceneResponse,
  updateScenarioVersionSceneResponseSchema,
} from "@/schemas/entities/scenarios/handlers/update-scenario-version-scene/response";
import { createHonoApp } from "@/utils/create-hono-app";
import { throwAPIError } from "@/utils/throw-api-error";

export const updateScenarioVersionSceneRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId/versions/:versionId/chapters/:chapterId/scenes/:sceneId",
);

// PATCH /api/v1/scenarios/{scenarioId}/versions/{versionId}/chapters/{chapterId}/scenes/{sceneId}
updateScenarioVersionSceneRoute.patch(
  "/",
  sessionMiddleware,
  zValidator("param", updateScenarioVersionSceneParamsSchema),
  zValidator("json", updateScenarioVersionSceneBodySchema),
  async (c) => {
    const { scenarioId, versionId, chapterId, sceneId } = c.req.valid("param");
    const updateData = c.req.valid("json");
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

    // Проверяем, что chapter принадлежит версии
    const chapter = await db.query.scenarioChapter.findFirst({
      where: (scenarioChapter, { eq, and }) =>
        and(
          eq(scenarioChapter.id, chapterId),
          eq(scenarioChapter.scenarioVersionId, versionId),
        ),
    });

    if (!chapter) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Раздел сценария не найден",
      });
    }

    // Проверяем, что scene принадлежит chapter
    const existingScene = await db.query.scenarioScene.findFirst({
      where: (scenarioScene, { eq, and }) =>
        and(
          eq(scenarioScene.id, sceneId),
          eq(scenarioScene.scenarioChapterId, chapterId),
        ),
    });

    if (!existingScene) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Сцена не найдена",
      });
    }

    const [updatedScene] = await db
      .update(scenarioScene)
      .set(updateData)
      .where(
        and(
          eq(scenarioScene.id, sceneId),
          eq(scenarioScene.scenarioChapterId, chapterId),
        ),
      )
      .returning();

    return c.json<UpdateScenarioVersionSceneResponse>(
      updateScenarioVersionSceneResponseSchema.parse({
        data: updatedScene,
      }),
    );
  },
);
