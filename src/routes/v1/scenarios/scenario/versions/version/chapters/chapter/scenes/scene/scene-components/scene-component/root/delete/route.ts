import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { scenarioSceneComponent } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { deleteScenarioVersionSceneComponentParamsSchema } from "@/schemas/entities/scenarios/handlers/delete-scenario-version-scene-component/params";
import {
  type DeleteScenarioVersionSceneComponentResponse,
  deleteScenarioVersionSceneComponentResponseSchema,
} from "@/schemas/entities/scenarios/handlers/delete-scenario-version-scene-component/response";
import { createHonoApp } from "@/utils/create-hono-app";
import { throwAPIError } from "@/utils/throw-api-error";

export const deleteScenarioVersionSceneComponentRoute =
  createHonoApp().basePath(
    "/scenarios/:scenarioId/versions/:versionId/chapters/:chapterId/scenes/:sceneId/scene-components/:sceneComponentId",
  );

// DELETE /api/v1/scenarios/{scenarioId}/versions/{versionId}/chapters/{chapterId}/scenes/{sceneId}/scene-components/{sceneComponentId}
deleteScenarioVersionSceneComponentRoute.delete(
  "/",
  sessionMiddleware,
  zValidator("param", deleteScenarioVersionSceneComponentParamsSchema),
  async (c) => {
    const { scenarioId, versionId, chapterId, sceneId, sceneComponentId } =
      c.req.valid("param");
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
    const scene = await db.query.scenarioScene.findFirst({
      where: (scenarioScene, { eq, and }) =>
        and(
          eq(scenarioScene.id, sceneId),
          eq(scenarioScene.scenarioChapterId, chapterId),
        ),
    });

    if (!scene) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Сцена не найдена",
      });
    }

    // Проверяем, что scene-component принадлежит scene
    const existingComponent = await db.query.scenarioSceneComponent.findFirst({
      where: (scenarioSceneComponent, { eq, and }) =>
        and(
          eq(scenarioSceneComponent.id, sceneComponentId),
          eq(scenarioSceneComponent.scenarioSceneId, sceneId),
        ),
    });

    if (!existingComponent) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Компонент сцены не найден",
      });
    }

    const [deletedComponent] = await db
      .delete(scenarioSceneComponent)
      .where(
        and(
          eq(scenarioSceneComponent.id, sceneComponentId),
          eq(scenarioSceneComponent.scenarioSceneId, sceneId),
        ),
      )
      .returning();

    return c.json<DeleteScenarioVersionSceneComponentResponse>(
      deleteScenarioVersionSceneComponentResponseSchema.parse({
        data: deletedComponent,
      }),
    );
  },
);
