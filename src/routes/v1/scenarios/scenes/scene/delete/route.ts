import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { scenarioScene } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { deleteScenarioSceneParamsSchema } from "@/schemas/entities/scenarios/handlers/delete-scenario-scene/params";
import {
  type DeleteScenarioSceneResponse,
  deleteScenarioSceneResponseSchema,
} from "@/schemas/entities/scenarios/handlers/delete-scenario-scene/response";
import { createHonoApp } from "@/utils/create-hono-app";
import { throwAPIError } from "@/utils/throw-api-error";

export const deleteScenarioSceneRoute = createHonoApp().basePath(
  "/scenarios/scenes/:sceneId",
);

// DELETE /api/v1/scenarios/scenes/{sceneId}
deleteScenarioSceneRoute.delete(
  "/",
  sessionMiddleware,
  zValidator("param", deleteScenarioSceneParamsSchema),
  async (c) => {
    const { sceneId } = c.req.valid("param");
    const user = c.get("user");

    // Проверяем владельца через JOIN
    const existingScene = await db.query.scenarioScene.findFirst({
      where: (scenarioScene, { eq }) => eq(scenarioScene.id, sceneId),
      with: {
        scenarioChapter: {
          with: {
            scenarioVersion: {
              with: {
                scenario: true,
              },
            },
          },
        },
      },
    });

    if (!existingScene) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Сцена не найдена",
      });
    }

    if (
      existingScene.scenarioChapter.scenarioVersion.scenario.userId !== user.id
    ) {
      return throwAPIError({
        code: APIErrorCode.Forbidden,
        message: "У вас нет доступа к этой сцене",
      });
    }

    const [deletedScene] = await db
      .delete(scenarioScene)
      .where(eq(scenarioScene.id, sceneId))
      .returning();

    return c.json<DeleteScenarioSceneResponse>(
      deleteScenarioSceneResponseSchema.parse({
        data: deletedScene,
      }),
    );
  },
);
