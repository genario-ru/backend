import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { scenarioVersion } from "@/db/schema";
import { deleteScenarioVersionParamsSchema } from "@/domains/scenarios/schemas/handlers/delete-scenario-version/params";
import {
  type DeleteScenarioVersionResponse,
  deleteScenarioVersionResponseSchema,
} from "@/domains/scenarios/schemas/handlers/delete-scenario-version/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

export const deleteScenarioVersionRoute = createHonoApp().basePath(
  "/scenarios/versions/:versionId",
);

// DELETE /api/v1/scenarios/versions/{versionId}
deleteScenarioVersionRoute.delete(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "delete-scenario-version",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario version deleted successfully",
        schema: deleteScenarioVersionResponseSchema,
      }),
    },
  }),
  validator("param", deleteScenarioVersionParamsSchema),
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
