import { and, eq, inArray } from "drizzle-orm";
import { difference } from "es-toolkit";
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
import {
  type UpdateScenarioBody,
  updateScenarioBodySchema,
} from "@/domains/scenarios/schemas/handlers/update-scenario/body";
import { updateScenarioParamsSchema } from "@/domains/scenarios/schemas/handlers/update-scenario/params";
import {
  type UpdateScenarioResponse,
  updateScenarioResponseSchema,
} from "@/domains/scenarios/schemas/handlers/update-scenario/response";
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

export const updateScenarioRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId",
);

// PATCH /api/v1/scenarios/{scenarioId}
updateScenarioRoute.patch(
  "/",
  rateLimitMiddleware({
    keyPrefix: "update-scenario",
    windowMs: 60 * 1000,
    limit: 3,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario updated successfully",
        schema: updateScenarioResponseSchema,
      }),
    },
  }),
  validator("param", updateScenarioParamsSchema),
  validator("json", updateScenarioBodySchema),
  async (c) => {
    const user = c.get("user");
    const { scenarioId } = c.req.valid("param");
    const requestBody = c.req.valid("json") as UpdateScenarioBody;

    const {
      platformIds: newPlatformIds,
      toneIds: newToneIds,
      regenerate: shouldRegenerate,
      ...updateScenarioParams
    } = requestBody;

    if (shouldRegenerate) {
      const creditsBalance = await getCreditsBalance({ userId: user.id });

      if (creditsBalance < AVERAGE_SCENARIO_CREDITS_COST) {
        return throwAPIError({
          code: APIErrorCode.PaymentRequired,
          message: "Недостаточно кредитов для генерации сценария",
        });
      }
    }

    const foundScenario = await db.query.scenario.findFirst({
      where: (scenario, { eq, and }) =>
        and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)),
      with: { scenarioToPlatform: true, scenarioToTone: true },
    });

    if (!foundScenario) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный сценарий не существует или у вас нет возможности редактировать его",
      });
    }

    const oldPlatformIds = foundScenario.scenarioToPlatform.map(
      ({ platformId }) => platformId,
    );

    const createPlatformIds = newPlatformIds
      ? difference(newPlatformIds, oldPlatformIds)
      : [];

    const deletePlatformIds = newPlatformIds
      ? difference(oldPlatformIds, newPlatformIds)
      : [];

    const oldToneIds = foundScenario.scenarioToTone.map(({ toneId }) => toneId);
    const createToneIds = newToneIds ? difference(newToneIds, oldToneIds) : [];
    const deleteToneIds = newToneIds ? difference(oldToneIds, newToneIds) : [];

    const updatedScenario = await db.transaction(async (tx) => {
      const updateScenarioPromises: Promise<any>[] = [];

      if (createPlatformIds.length > 0) {
        updateScenarioPromises.push(
          tx.insert(scenarioToPlatform).values(
            createPlatformIds.map((platformId) => ({
              scenarioId,
              platformId,
            })),
          ),
        );
      }

      if (deletePlatformIds.length > 0) {
        updateScenarioPromises.push(
          tx
            .delete(scenarioToPlatform)
            .where(
              and(
                eq(scenarioToPlatform.scenarioId, scenarioId),
                inArray(scenarioToPlatform.platformId, deletePlatformIds),
              ),
            ),
        );
      }

      if (createToneIds.length > 0) {
        updateScenarioPromises.push(
          tx.insert(scenarioToTone).values(
            createToneIds.map((toneId) => ({
              scenarioId,
              toneId,
            })),
          ),
        );
      }

      if (deleteToneIds.length > 0) {
        updateScenarioPromises.push(
          tx
            .delete(scenarioToTone)
            .where(
              and(
                eq(scenarioToTone.scenarioId, scenarioId),
                inArray(scenarioToTone.toneId, deleteToneIds),
              ),
            ),
        );
      }

      const [[updatedScenario]] = await Promise.all([
        tx
          .update(scenario)
          .set(updateScenarioParams)
          .where(and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)))
          .returning(),
        ...updateScenarioPromises,
      ]);

      return updatedScenario;
    });

    if (shouldRegenerate) {
      const [createdScenarioVersion] = await db
        .insert(scenarioVersion)
        .values({ scenarioId })
        .returning();

      await enqueueScenarioChaptersGeneration({
        scenarioId: foundScenario.id,
        scenarioVersionId: createdScenarioVersion.id,
      });
    }

    return c.json<UpdateScenarioResponse>(
      updateScenarioResponseSchema.parse({
        data: updatedScenario,
      }),
    );
  },
);
