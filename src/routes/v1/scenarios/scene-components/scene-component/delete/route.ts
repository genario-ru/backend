import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { scenarioSceneComponent } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { deleteScenarioSceneComponentParamsSchema } from "@/schemas/entities/scenarios/handlers/delete-scenario-scene-component/params";
import {
  type DeleteScenarioSceneComponentResponse,
  deleteScenarioSceneComponentResponseSchema,
} from "@/schemas/entities/scenarios/handlers/delete-scenario-scene-component/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const deleteScenarioSceneComponentRoute = createHonoApp().basePath(
  "/scenarios/scene-components/:sceneComponentId",
);

// DELETE /api/v1/scenarios/scene-components/{sceneComponentId}
deleteScenarioSceneComponentRoute.delete(
  "/",
  sessionMiddleware,
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
