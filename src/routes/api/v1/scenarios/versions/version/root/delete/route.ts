import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

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
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

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
