import { and, eq, inArray } from "drizzle-orm";
import { difference } from "es-toolkit";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { scenario, scenarioToTone, scenarioVersion } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { enqueueScenarioChaptersGeneration } from "@/mq/scenario-chapters-generation/queue";
import { APIErrorCode } from "@/schemas/common/api-error";
import {
  type UpdateScenarioBody,
  updateScenarioBodySchema,
} from "@/schemas/entities/scenarios/handlers/update-scenario/body";
import { updateScenarioParamsSchema } from "@/schemas/entities/scenarios/handlers/update-scenario/params";
import {
  type UpdateScenarioResponse,
  updateScenarioResponseSchema,
} from "@/schemas/entities/scenarios/handlers/update-scenario/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const updateScenarioRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId",
);

// PATCH /api/v1/scenarios/{scenarioId}
updateScenarioRoute.patch(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "update-scenario",
    windowMs: 60 * 1000,
    limit: 3,
  }),
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
      toneIds: newToneIds,
      regenerate: shouldRegenerate,
      ...updateScenarioParams
    } = requestBody;

    const foundScenario = await db.query.scenario.findFirst({
      where: (scenario, { eq, and }) =>
        and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)),
      with: {
        scenarioToTone: true,
      },
    });

    if (!foundScenario) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный сценарий не существует или у вас нет возможности редактировать его",
      });
    }

    const oldToneIds = foundScenario.scenarioToTone.map(({ toneId }) => toneId);
    const createToneIds = newToneIds ? difference(newToneIds, oldToneIds) : [];
    const deleteToneIds = newToneIds ? difference(oldToneIds, newToneIds) : [];

    const { updatedScenario, createdScenarioVersion } = await db.transaction(
      async (tx) => {
        const updateScenarioPromises: Promise<any>[] = [];

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

        const [createdScenarioVersion] = shouldRegenerate
          ? await tx.insert(scenarioVersion).values({ scenarioId }).returning()
          : [undefined];

        const newScenarioVersionId =
          createdScenarioVersion?.id ?? foundScenario.currentVersionId;

        const [[updatedScenario]] = await Promise.all([
          tx
            .update(scenario)
            .set({
              ...updateScenarioParams,
              currentVersionId: newScenarioVersionId,
            })
            .where(
              and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)),
            )
            .returning(),
          ...updateScenarioPromises,
        ]);

        return {
          updatedScenario,
          createdScenarioVersion,
        };
      },
    );

    if (shouldRegenerate && createdScenarioVersion) {
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
