import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { scenarioSceneComponent } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { updateScenarioSceneComponentBodySchema } from "@/schemas/entities/scenarios/handlers/update-scenario-scene-component/body";
import { updateScenarioSceneComponentParamsSchema } from "@/schemas/entities/scenarios/handlers/update-scenario-scene-component/params";
import {
  type UpdateScenarioSceneComponentResponse,
  updateScenarioSceneComponentResponseSchema,
} from "@/schemas/entities/scenarios/handlers/update-scenario-scene-component/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const updateScenarioSceneComponentRoute = createHonoApp().basePath(
  "/scenarios/scene-components/:sceneComponentId",
);

// PATCH /api/v1/scenarios/scene-components/{sceneComponentId}
updateScenarioSceneComponentRoute.patch(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "update-scenario-scene-component",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario scene component updated successfully",
        schema: updateScenarioSceneComponentResponseSchema,
      }),
    },
  }),
  validator("param", updateScenarioSceneComponentParamsSchema),
  validator("json", updateScenarioSceneComponentBodySchema),
  async (c) => {
    const { sceneComponentId } = c.req.valid("param");
    const updateData = c.req.valid("json");
    const user = c.get("user");

    // Проверяем владельца через JOIN
    const existingComponent = await db.query.scenarioSceneComponent.findFirst({
      where: (scenarioSceneComponent, { eq }) =>
        eq(scenarioSceneComponent.id, sceneComponentId),
      with: {
        scenarioScene: {
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
        },
      },
    });

    if (!existingComponent) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Компонент сцены не найден",
      });
    }

    if (
      existingComponent.scenarioScene.scenarioChapter.scenarioVersion.scenario
        .userId !== user.id
    ) {
      return throwAPIError({
        code: APIErrorCode.Forbidden,
        message: "У вас нет доступа к этому компоненту сцены",
      });
    }

    const [updatedComponent] = await db
      .update(scenarioSceneComponent)
      .set(updateData)
      .where(eq(scenarioSceneComponent.id, sceneComponentId))
      .returning();

    return c.json<UpdateScenarioSceneComponentResponse>(
      updateScenarioSceneComponentResponseSchema.parse({
        data: updatedComponent,
      }),
    );
  },
);
