import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import {
  type GetMyScenariosResponse,
  getMyScenariosResponseSchema,
} from "@/schemas/entities/scenarios/handlers/get-my-scenarios/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const getMyScenariosRoute = createHonoApp().basePath("/scenarios/my");

// GET /api/v1/scenarios/my
getMyScenariosRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-my-scenarios",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "My scenarios retrieved successfully",
        schema: getMyScenariosResponseSchema,
      }),
    },
  }),
  async (c) => {
    const user = c.get("user");

    const foundScenarios = await db.query.scenario.findMany({
      where: (scenario, { eq }) => eq(scenario.userId, user.id),
      with: {
        profile: true,
        platform: true,
        videoType: true,
        videoDuration: true,
        scenarioToTone: {
          with: { tone: true },
        },
      },
    });

    return c.json<GetMyScenariosResponse>(
      getMyScenariosResponseSchema.parse({
        data: foundScenarios.map((scenario) => ({
          ...scenario,
          tones: scenario.scenarioToTone.map(({ tone }) => tone),
        })),
      }),
    );
  },
);
