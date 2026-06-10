import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { scenarioSceneComponent } from "@/db/schema";
import { deleteScenarioSceneComponentParamsSchema } from "@/domains/scenarios/schemas/handlers/delete-scenario-scene-component/params";
import {
  type DeleteScenarioSceneComponentResponse,
  deleteScenarioSceneComponentResponseSchema,
} from "@/domains/scenarios/schemas/handlers/delete-scenario-scene-component/response";
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

export const deleteScenarioSceneComponentRoute = createHonoApp().basePath(
  "/scenarios/scene-components/:sceneComponentId",
);

// DELETE /api/v1/scenarios/scene-components/{sceneComponentId}
deleteScenarioSceneComponentRoute.delete(
  "/",
  rateLimitMiddleware({
    keyPrefix: "delete-scenario-scene-component",
    windowMs: 3 * 1000,
    limit: 1,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario scene component deleted successfully",
        schema: deleteScenarioSceneComponentResponseSchema,
      }),
    },
  }),
  validator("param", deleteScenarioSceneComponentParamsSchema),
  async (c) => {
    const { sceneComponentId } = c.req.valid("param");
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

    const [deletedComponent] = await db
      .delete(scenarioSceneComponent)
      .where(eq(scenarioSceneComponent.id, sceneComponentId))
      .returning();

    return c.json<DeleteScenarioSceneComponentResponse>(
      deleteScenarioSceneComponentResponseSchema.parse({
        data: deletedComponent,
      }),
    );
  },
);
