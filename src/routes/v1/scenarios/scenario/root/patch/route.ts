import { zValidator } from "@hono/zod-validator";
import { and, eq, inArray } from "drizzle-orm";
import { difference } from "es-toolkit";

import { db } from "@/db";
import { scenario, scenarioToTone, scenarioVersion } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { updateScenarioBodySchema } from "@/schemas/entities/scenarios/handlers/update-scenario/body";
import { updateScenarioParamsSchema } from "@/schemas/entities/scenarios/handlers/update-scenario/params";
import {
  type UpdateScenarioResponse,
  updateScenarioResponseSchema,
} from "@/schemas/entities/scenarios/handlers/update-scenario/response";
import { createHonoApp } from "@/utils/create-hono-app";
import { throwAPIError } from "@/utils/throw-api-error";

export const updateScenarioRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId",
);

// PATCH /api/v1/scenarios/{scenarioId}
updateScenarioRoute.patch(
  "/",
  sessionMiddleware,
  zValidator("param", updateScenarioParamsSchema),
  zValidator("json", updateScenarioBodySchema),
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

      // TODO: Запустить процесс генерации новой версии сценария на основе введенных параметров

      return updatedScenario;
    });

    return c.json<UpdateScenarioResponse>(
      updateScenarioResponseSchema.parse({
        data: updatedScenario,
      }),
    );
  },
);
