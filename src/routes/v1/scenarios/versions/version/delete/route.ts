import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { scenarioVersion } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { deleteScenarioVersionParamsSchema } from "@/schemas/entities/scenarios/handlers/delete-scenario-version/params";
import {
  type DeleteScenarioVersionResponse,
  deleteScenarioVersionResponseSchema,
} from "@/schemas/entities/scenarios/handlers/delete-scenario-version/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const deleteScenarioVersionRoute = createHonoApp().basePath(
  "/scenarios/versions/:versionId",
);

// DELETE /api/v1/scenarios/versions/{versionId}
deleteScenarioVersionRoute.delete(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario version deleted successfully",
        schema: deleteScenarioVersionResponseSchema,
      }),
    },
  }),
  zValidator("param", deleteScenarioVersionParamsSchema),
  async (c) => {
    const { versionId } = c.req.valid("param");
    const user = c.get("user");

    // Проверяем владельца через JOIN
    const existingVersion = await db.query.scenarioVersion.findFirst({
      where: (scenarioVersion, { eq }) => eq(scenarioVersion.id, versionId),
      with: {
        scenario: true,
      },
    });

    if (!existingVersion) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Версия сценария не найдена",
      });
    }

    if (existingVersion.scenario.userId !== user.id) {
      return throwAPIError({
        code: APIErrorCode.Forbidden,
        message:
          "Данный сценарий не существует или у вас нет возможности удалить его",
      });
    }

    const [deletedVersion] = await db
      .delete(scenarioVersion)
      .where(eq(scenarioVersion.id, versionId))
      .returning();

    return c.json<DeleteScenarioVersionResponse>(
      deleteScenarioVersionResponseSchema.parse({
        data: deletedVersion,
      }),
    );
  },
);
