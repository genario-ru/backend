import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { scenario, scenarioToTone, scenarioVersion } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { enqueueScenarioVersionGeneration } from "@/mq/queues/scenario-chapters-generation-queue";
import { createScenarioBodySchema } from "@/schemas/entities/scenarios/handlers/create-scenario/body";
import {
  type CreateScenarioResponse,
  createScenarioResponseSchema,
} from "@/schemas/entities/scenarios/handlers/create-scenario/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const createScenarioRoute = createHonoApp().basePath("/scenarios");

// POST /api/v1/scenarios
createScenarioRoute.post(
  "/",
  sessionMiddleware,
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
    const { toneIds, ...createScenarioParams } = c.req.valid("json");
    const user = c.get("user");
    let createdScenarioVersionId: string | null = null;

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

      createdScenarioVersionId = createdScenarioVersion.id;

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

      return createdScenario;
    });

    if (createdScenarioVersionId) {
      await enqueueScenarioVersionGeneration({
        userId: user.id,
        scenarioVersionId: createdScenarioVersionId,
        source: "create",
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
