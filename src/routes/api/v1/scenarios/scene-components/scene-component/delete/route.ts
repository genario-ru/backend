import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { scenarioSceneComponent } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { deleteScenarioSceneComponentParamsSchema } from "@/schemas/domains/scenarios/handlers/delete-scenario-scene-component/params";
import {
  type DeleteScenarioSceneComponentResponse,
  deleteScenarioSceneComponentResponseSchema,
} from "@/schemas/domains/scenarios/handlers/delete-scenario-scene-component/response";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

export const deleteScenarioSceneComponentRoute = createHonoApp().basePath(
  "/scenarios/scene-components/:sceneComponentId",
);

// DELETE /api/v1/scenarios/scene-components/{sceneComponentId}
deleteScenarioSceneComponentRoute.delete(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "delete-scenario-scene-component",
    windowMs: 60 * 1000,
    limit: 10,
  }),
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
