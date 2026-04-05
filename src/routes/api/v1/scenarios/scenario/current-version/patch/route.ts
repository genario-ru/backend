import { and, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { scenario } from "@/db/schema";
import { updateScenarioCurrentVersionBodySchema } from "@/domains/scenarios/schemas/handlers/update-scenario-current-version/body";
import { updateScenarioCurrentVersionParamsSchema } from "@/domains/scenarios/schemas/handlers/update-scenario-current-version/params";
import {
  type UpdateScenarioCurrentVersionResponse,
  updateScenarioCurrentVersionResponseSchema,
} from "@/domains/scenarios/schemas/handlers/update-scenario-current-version/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const updateScenarioCurrentVersionRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId/current-version",
);

// PATCH /api/v1/scenarios/{scenarioId}/current-version
updateScenarioCurrentVersionRoute.patch(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "update-scenario-current-version",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario current version updated successfully",
        schema: updateScenarioCurrentVersionResponseSchema,
      }),
    },
  }),
  validator("param", updateScenarioCurrentVersionParamsSchema),
  validator("json", updateScenarioCurrentVersionBodySchema),
  async (c) => {
    const { scenarioId } = c.req.valid("param");
    const { currentVersionId: newCurrentVersionId } = c.req.valid("json");
    const user = c.get("user");

    const [updatedScenario] = await db
      .update(scenario)
      .set({ currentVersionId: newCurrentVersionId })
      .where(and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)))
      .returning();

    return c.json<UpdateScenarioCurrentVersionResponse>(
      updateScenarioCurrentVersionResponseSchema.parse({
        data: updatedScenario,
      }),
    );
  },
);
