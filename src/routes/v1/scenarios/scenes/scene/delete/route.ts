import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { scenarioScene } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { deleteScenarioSceneParamsSchema } from "@/schemas/entities/scenarios/handlers/delete-scenario-scene/params";
import {
  type DeleteScenarioSceneResponse,
  deleteScenarioSceneResponseSchema,
} from "@/schemas/entities/scenarios/handlers/delete-scenario-scene/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const deleteScenarioSceneRoute = createHonoApp().basePath(
  "/scenarios/scenes/:sceneId",
);

// DELETE /api/v1/scenarios/scenes/{sceneId}
deleteScenarioSceneRoute.delete(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario scene deleted successfully",
        schema: deleteScenarioSceneResponseSchema,
      }),
    },
  }),
  validator("param", deleteScenarioSceneParamsSchema),
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
