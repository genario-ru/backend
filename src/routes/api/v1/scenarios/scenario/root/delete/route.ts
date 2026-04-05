import { and, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { scenario } from "@/db/schema";
import { deleteScenarioParamsSchema } from "@/domains/scenarios/schemas/handlers/delete-scenario/params";
import {
  type DeleteScenarioResponse,
  deleteScenarioResponseSchema,
} from "@/domains/scenarios/schemas/handlers/delete-scenario/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const deleteScenarioRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId",
);

// DELETE /api/v1/scenarios/{scenarioId}
deleteScenarioRoute.delete(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "delete-scenario",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario deleted successfully",
        schema: deleteScenarioResponseSchema,
      }),
    },
  }),
  validator("param", deleteScenarioParamsSchema),
  async (c) => {
    const { scenarioId } = c.req.valid("param");
    const user = c.get("user");

    const [deletedScenario] = await db
      .delete(scenario)
      .where(and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)))
      .returning();

    return c.json<DeleteScenarioResponse>(
      deleteScenarioResponseSchema.parse({
        data: deletedScenario,
      }),
    );
  },
);
