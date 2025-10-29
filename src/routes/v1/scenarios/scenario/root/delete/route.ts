import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { scenario } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { deleteScenarioParamsSchema } from "@/schemas/entities/scenarios/handlers/delete-scenario/params";
import {
  type DeleteScenarioResponse,
  deleteScenarioResponseSchema,
} from "@/schemas/entities/scenarios/handlers/delete-scenario/response";
import { createHonoApp } from "@/utils/create-hono-app";

export const deleteScenarioRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId",
);

// DELETE /api/v1/scenarios/{scenarioId}
deleteScenarioRoute.delete(
  "/",
  sessionMiddleware,
  zValidator("param", deleteScenarioParamsSchema),
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
