import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { getScenarioParamsSchema } from "@/schemas/entities/scenarios/handlers/get-scenario/params";
import {
  type GetScenarioResponse,
  getScenarioResponseSchema,
} from "@/schemas/entities/scenarios/handlers/get-scenario/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const getScenarioRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId",
);

// GET /api/v1/scenarios/{scenarioId}
getScenarioRoute.get(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario retrieved successfully",
        schema: getScenarioResponseSchema,
      }),
    },
  }),
  validator("param", getScenarioParamsSchema),
  async (c) => {
    const { scenarioId } = c.req.valid("param");
    const user = c.get("user");

    const foundScenario = await db.query.scenario.findFirst({
      where: (scenario, { eq, and }) => {
        return and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id));
      },
      with: {
        currentVersion: true,
        profile: true,
        template: true,
        platform: true,
        videoType: true,
        videoDuration: true,
        scenarioToTone: {
          with: { tone: true },
        },
      },
    });

    if (!foundScenario) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный сценарий не существует или у вас нет возможности просматривать его",
      });
    }

    const { scenarioToTone, ...scenario } = foundScenario;

    return c.json<GetScenarioResponse>(
      getScenarioResponseSchema.parse({
        data: {
          ...scenario,
          tones: scenarioToTone.map(({ tone }) => tone),
        },
      }),
    );
  },
);
