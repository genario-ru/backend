import { zValidator } from "@hono/zod-validator";

import { db } from "@/db";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { getScenarioVersionsParamsSchema } from "@/schemas/entities/scenarios/handlers/get-scenario-versions/params";
import {
  type GetScenarioVersionsResponse,
  getScenarioVersionsResponseSchema,
} from "@/schemas/entities/scenarios/handlers/get-scenario-versions/response";
import { createHonoApp } from "@/utils/create-hono-app";
import { throwAPIError } from "@/utils/throw-api-error";

export const getScenarioVersionsRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId/versions",
);

// GET /api/v1/scenarios/{scenarioId}/versions
getScenarioVersionsRoute.get(
  "/",
  sessionMiddleware,
  zValidator("param", getScenarioVersionsParamsSchema),
  async (c) => {
    const { scenarioId } = c.req.valid("param");
    const user = c.get("user");

    // Проверяем, что сценарий принадлежит пользователю
    const scenario = await db.query.scenario.findFirst({
      where: (scenario, { eq, and }) =>
        and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)),
    });

    if (!scenario) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Сценарий не найден",
      });
    }

    const versions = await db.query.scenarioVersion.findMany({
      where: (scenarioVersion, { eq }) =>
        eq(scenarioVersion.scenarioId, scenarioId),
      orderBy: (scenarioVersion, { desc }) => [desc(scenarioVersion.createdAt)],
    });

    return c.json<GetScenarioVersionsResponse>(
      getScenarioVersionsResponseSchema.parse({
        data: versions,
      }),
    );
  },
);
