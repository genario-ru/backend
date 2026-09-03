import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { scenarioScene } from "@/db/schema";
import { updateScenarioSceneBodySchema } from "@/domains/scenarios/schemas/handlers/update-scenario-scene/body";
import { updateScenarioSceneParamsSchema } from "@/domains/scenarios/schemas/handlers/update-scenario-scene/params";
import {
  type UpdateScenarioSceneResponse,
  updateScenarioSceneResponseSchema,
} from "@/domains/scenarios/schemas/handlers/update-scenario-scene/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const updateScenarioSceneRoute = createHonoApp().basePath(
  "/scenarios/scenes/:sceneId",
);

// PATCH /api/v1/scenarios/scenes/{sceneId}
updateScenarioSceneRoute.patch(
  "/",
  rateLimitMiddleware({
    keyPrefix: "update-scenario-scene",
    windowMs: 3 * 1000,
    limit: 1,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
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
      throw throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Сцена не найдена",
      });
    }

    if (
      existingScene.scenarioChapter.scenarioVersion.scenario.userId !== user.id
    ) {
      throw throwAPIError({
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
