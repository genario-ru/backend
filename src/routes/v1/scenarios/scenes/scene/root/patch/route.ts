import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { scenarioScene } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { updateScenarioSceneBodySchema } from "@/schemas/entities/scenarios/handlers/update-scenario-scene/body";
import { updateScenarioSceneParamsSchema } from "@/schemas/entities/scenarios/handlers/update-scenario-scene/params";
import {
  type UpdateScenarioSceneResponse,
  updateScenarioSceneResponseSchema,
} from "@/schemas/entities/scenarios/handlers/update-scenario-scene/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const updateScenarioSceneRoute = createHonoApp().basePath(
  "/scenarios/scenes/:sceneId",
);

// PATCH /api/v1/scenarios/scenes/{sceneId}
updateScenarioSceneRoute.patch(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario scene updated successfully",
        schema: updateScenarioSceneResponseSchema,
      }),
    },
  }),
  validator("param", updateScenarioSceneParamsSchema),
  validator("json", updateScenarioSceneBodySchema),
  async (c) => {
    const { sceneId } = c.req.valid("param");
    const updateData = c.req.valid("json");
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

    const [updatedScene] = await db
      .update(scenarioScene)
      .set(updateData)
      .where(eq(scenarioScene.id, sceneId))
      .returning();

    return c.json<UpdateScenarioSceneResponse>(
      updateScenarioSceneResponseSchema.parse({
        data: updatedScene,
      }),
    );
  },
);
