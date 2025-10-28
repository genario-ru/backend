import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { scenario, scenarioToTone, scenarioVersion } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { createScenarioBodySchema } from "@/schemas/entities/scenarios/handlers/create-scenario/body";
import {
  type CreateScenarioResponse,
  createScenarioResponseSchema,
} from "@/schemas/entities/scenarios/handlers/create-scenario/response";
import { createHonoApp } from "@/utils/create-hono-app";

export const createScenarioRoute = createHonoApp().basePath("/scenarios");

// POST /api/v1/scenarios
createScenarioRoute.post(
  "/",
  sessionMiddleware,
  zValidator("json", createScenarioBodySchema),
  async (c) => {
    const { toneIds, ...createScenarioParams } = c.req.valid("json");
    const user = c.get("user");

    const createdScenario = await db.transaction(async (tx) => {
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

      const scenarioPromises: Promise<any>[] = [
        tx
          .update(scenario)
          .set({ currentVersionId: createdScenarioVersion.id })
          .where(eq(scenario.id, createdScenario.id)),
      ];

      if (toneIds && toneIds.length > 0) {
        scenarioPromises.push(
          tx.insert(scenarioToTone).values(
            toneIds.map((toneId) => ({
              scenarioId: createdScenario.id,
              toneId,
            })),
          ),
        );
      }

      await Promise.all(scenarioPromises);

      // TODO: Запускаем процесс генерации версии сценария на основе введенных параметров

      return createdScenario;
    });

    return c.json<CreateScenarioResponse>(
      createScenarioResponseSchema.parse({
        data: createdScenario,
      }),
    );
  },
);
