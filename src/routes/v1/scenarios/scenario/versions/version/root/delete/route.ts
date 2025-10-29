import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { scenarioVersion } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { deleteScenarioVersionParamsSchema } from "@/schemas/entities/scenarios/handlers/delete-scenario-version/params";
import {
  type DeleteScenarioVersionResponse,
  deleteScenarioVersionResponseSchema,
} from "@/schemas/entities/scenarios/handlers/delete-scenario-version/response";
import { createHonoApp } from "@/utils/create-hono-app";
import { throwAPIError } from "@/utils/throw-api-error";

export const deleteScenarioVersionRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId/versions/:versionId",
);

// DELETE /api/v1/scenarios/{scenarioId}/versions/{versionId}
deleteScenarioVersionRoute.delete(
  "/",
  sessionMiddleware,
  zValidator("param", deleteScenarioVersionParamsSchema),
  async (c) => {
    const { scenarioId, versionId } = c.req.valid("param");
    const user = c.get("user");

    // Проверяем, что сценарий принадлежит пользователю
    const scenario = await db.query.scenario.findFirst({
      where: (scenario, { eq, and }) =>
        and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)),
    });

    if (!scenario) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный сценарий не существует или у вас нет возможности удалить его",
      });
    }

    // Проверяем, что версия принадлежит сценарию
    const existingVersion = await db.query.scenarioVersion.findFirst({
      where: (scenarioVersion, { eq, and }) =>
        and(
          eq(scenarioVersion.id, versionId),
          eq(scenarioVersion.scenarioId, scenarioId),
        ),
    });

    if (!existingVersion) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Версия сценария не найдена",
      });
    }

    const [deletedVersion] = await db
      .delete(scenarioVersion)
      .where(
        and(
          eq(scenarioVersion.id, versionId),
          eq(scenarioVersion.scenarioId, scenarioId),
        ),
      )
      .returning();

    return c.json<DeleteScenarioVersionResponse>(
      deleteScenarioVersionResponseSchema.parse({
        data: deletedVersion,
      }),
    );
  },
);
