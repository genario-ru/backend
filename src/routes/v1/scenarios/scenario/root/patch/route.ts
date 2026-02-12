import { and, eq, inArray } from "drizzle-orm";
import { difference } from "es-toolkit";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { scenario, scenarioToTone, scenarioVersion } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { enqueueScenarioChaptersGeneration } from "@/mq/queues/scenario-chapters-generation-queue";
import { APIErrorCode } from "@/schemas/common/api-error";
import { updateScenarioBodySchema } from "@/schemas/entities/scenarios/handlers/update-scenario/body";
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
    const { scenarioId } = c.req.valid("param");
    const { toneIds: newToneIds, ...updateScenarioParams } =
      c.req.valid("json");
    const user = c.get("user");

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

    let createdScenarioVersionId: string | null = null;

    const updatedScenario = await db.transaction(async (tx) => {
      const updateScenarioPromises: Promise<any>[] = [];

      if (newToneIds) {
        const oldToneIds = foundScenario.scenarioToTone.map(
          ({ toneId }) => toneId,
        );

        const createToneIds = difference(newToneIds, oldToneIds);
        const deleteToneIds = difference(oldToneIds, newToneIds);

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
      }

      const [[updatedScenario], [_newScenarioVersion]] = await Promise.all([
        tx
          .update(scenario)
          .set(updateScenarioParams)
          .where(and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)))
          .returning(),
        tx.insert(scenarioVersion).values({ scenarioId }).returning(),
        ...updateScenarioPromises,
      ]);

      createdScenarioVersionId = _newScenarioVersion.id;

      return updatedScenario;
    });

    if (createdScenarioVersionId) {
      await enqueueScenarioChaptersGeneration({
        userId: user.id,
        scenarioVersionId: createdScenarioVersionId,
        source: "update",
      });
    }

    return c.json<UpdateScenarioResponse>(
      updateScenarioResponseSchema.parse({
        data: updatedScenario,
      }),
    );
  },
);
