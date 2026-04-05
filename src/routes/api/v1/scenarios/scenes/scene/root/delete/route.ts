import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { scenarioScene } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { deleteScenarioSceneParamsSchema } from "@/schemas/domains/scenarios/handlers/delete-scenario-scene/params";
import {
  type DeleteScenarioSceneResponse,
  deleteScenarioSceneResponseSchema,
} from "@/schemas/domains/scenarios/handlers/delete-scenario-scene/response";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

export const deleteScenarioSceneRoute = createHonoApp().basePath(
  "/scenarios/scenes/:sceneId",
);

// DELETE /api/v1/scenarios/scenes/{sceneId}
deleteScenarioSceneRoute.delete(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "delete-scenario-scene",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
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
