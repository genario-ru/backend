import { validator } from "hono-openapi";

import { db } from "@/db";
import {
  scenario,
  scenarioToPlatform,
  scenarioToTone,
  scenarioVersion,
} from "@/db/schema";
import { getCreditsBalance } from "@/domains/credits/services/get-credits-balance";
import { AVERAGE_SCENARIO_CREDITS_COST } from "@/domains/scenarios/constants/credits-pricing";
import { createScenarioBodySchema } from "@/domains/scenarios/schemas/handlers/create-scenario/body";
import {
  type CreateScenarioResponse,
  createScenarioResponseSchema,
} from "@/domains/scenarios/schemas/handlers/create-scenario/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { enqueueScenarioChaptersGeneration } from "@/mq/scenario-chapters-generation/queue";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const createScenarioRoute = createHonoApp().basePath("/scenarios");

// POST /api/v1/scenarios
createScenarioRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "create-scenario",
    windowMs: 5 * 1000,
    limit: 1,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Created]: createOpenAPIResponse({
        description: "Scenario created successfully",
        schema: createScenarioResponseSchema,
      }),
    },
  }),
  validator("json", createScenarioBodySchema),
  async (c) => {
    const { platformIds, toneIds, ...createScenarioParams } =
      c.req.valid("json");
    const user = c.get("user");
    const creditsBalance = await getCreditsBalance({ userId: user.id });

    if (creditsBalance < AVERAGE_SCENARIO_CREDITS_COST) {
      throw throwAPIError({
        code: APIErrorCode.PaymentRequired,
        message: "Недостаточно кредитов для создания сценария",
      });
    }

    const { createdScenario, createdScenarioVersion } = await db.transaction(
      async (tx) => {
        const [createdScenario] = await tx
          .insert(scenario)
          .values({
            userId: user.id,
            ...createScenarioParams,
          })
          .returning();

        const [createdScenarioVersion] = await tx
          .insert(scenarioVersion)
          .values({ scenarioId: createdScenario.id })
          .returning();

        if (platformIds && platformIds.length > 0) {
          await tx.insert(scenarioToPlatform).values(
            platformIds.map((platformId) => ({
              scenarioId: createdScenario.id,
              platformId,
            })),
          );
        }

        if (toneIds && toneIds.length > 0) {
          await tx.insert(scenarioToTone).values(
            toneIds.map((toneId) => ({
              scenarioId: createdScenario.id,
              toneId,
            })),
          );
        }

        return {
          createdScenario,
          createdScenarioVersion,
        };
      },
    );

    if (createdScenarioVersion) {
      await enqueueScenarioChaptersGeneration({
        scenarioId: createdScenario.id,
        scenarioVersionId: createdScenarioVersion.id,
      });
    }

    return c.json<CreateScenarioResponse>(
      createScenarioResponseSchema.parse({
        data: createdScenario,
      }),
      HTTPStatusCode.Created,
    );
  },
);
