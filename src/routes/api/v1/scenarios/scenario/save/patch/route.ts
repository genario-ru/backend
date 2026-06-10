import { and, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { scenario } from "@/db/schema";
import { saveScenarioBodySchema } from "@/domains/scenarios/schemas/handlers/save-scenario/body";
import { saveScenarioParamsSchema } from "@/domains/scenarios/schemas/handlers/save-scenario/params";
import {
  type SaveScenarioResponse,
  saveScenarioResponseSchema,
} from "@/domains/scenarios/schemas/handlers/save-scenario/response";
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

export const saveScenarioRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId",
);

// PATCH /api/v1/scenarios/{scenarioId}/save
saveScenarioRoute.patch(
  "/save",
  rateLimitMiddleware({
    keyPrefix: "save-scenario",
    windowMs: 1000,
    limit: 1,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario saved/unsaved successfully",
        schema: saveScenarioResponseSchema,
      }),
    },
  }),
  validator("param", saveScenarioParamsSchema),
  validator("json", saveScenarioBodySchema),
  async (c) => {
    const { scenarioId } = c.req.valid("param");
    const { saved } = c.req.valid("json");
    const user = c.get("user");

    const foundScenario = await db.query.scenario.findFirst({
      where: (scenario, { eq, and }) =>
        and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)),
    });

    if (!foundScenario) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный сценарий не существует или у вас нет возможности редактировать его",
      });
    }

    const [updatedScenario] = await db
      .update(scenario)
      .set({ saved })
      .where(and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)))
      .returning();

    return c.json<SaveScenarioResponse>(
      saveScenarioResponseSchema.parse({
        data: updatedScenario,
      }),
    );
  },
);
