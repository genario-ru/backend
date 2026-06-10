import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { scenarioSceneComponent } from "@/db/schema";
import { updateScenarioSceneComponentBodySchema } from "@/domains/scenarios/schemas/handlers/update-scenario-scene-component/body";
import { updateScenarioSceneComponentParamsSchema } from "@/domains/scenarios/schemas/handlers/update-scenario-scene-component/params";
import {
  type UpdateScenarioSceneComponentResponse,
  updateScenarioSceneComponentResponseSchema,
} from "@/domains/scenarios/schemas/handlers/update-scenario-scene-component/response";
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

export const updateScenarioSceneComponentRoute = createHonoApp().basePath(
  "/scenarios/scene-components/:sceneComponentId",
);

// PATCH /api/v1/scenarios/scene-components/{sceneComponentId}
updateScenarioSceneComponentRoute.patch(
  "/",
  rateLimitMiddleware({
    keyPrefix: "update-scenario-scene-component",
    windowMs: 3 * 1000,
    limit: 1,
  }),
  sessionMiddleware,
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
    const foundSceneComponent = await db.query.scenarioSceneComponent.findFirst(
      {
        where: (scenarioSceneComponent, { eq }) =>
          eq(scenarioSceneComponent.id, sceneComponentId),
        with: {
          scenarioScene: {
            with: {
              scenarioChapter: {
                with: {
                  scenarioVersion: true,
                },
              },
            },
          },
        },
      },
    );

    if (!foundSceneComponent) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Запрашиваемый компонент сцены не найден",
      });
    }

    const foundScenario = await db.query.scenario.findFirst({
      where: (scenario, { and, eq }) =>
        and(
          eq(scenario.userId, user.id),
          eq(
            scenario.id,
            foundSceneComponent.scenarioScene.scenarioChapter.scenarioVersion
              .scenarioId,
          ),
        ),
    });

    if (!foundScenario) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Сценарий для указнного компонента сцены не существует или у вас нет доступа к нему",
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
