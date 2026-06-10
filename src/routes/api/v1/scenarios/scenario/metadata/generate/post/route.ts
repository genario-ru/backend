import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { scenario } from "@/db/schema";
import { generateScenarioMetadataParamsSchema } from "@/domains/scenarios/schemas/handlers/generate-scenario-metadata/params";
import {
  type GenerateScenarioMetadataResponse,
  generateScenarioMetadataResponseSchema,
} from "@/domains/scenarios/schemas/handlers/generate-scenario-metadata/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { enqueueScenarioMetadataGeneration } from "@/mq/scenario-metadata-generation/queue";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const generateScenarioMetadataRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId/metadata",
);

// POST /api/v1/scenarios/{scenarioId}/metadata/generate
generateScenarioMetadataRoute.post(
  "/generate",
  rateLimitMiddleware({
    keyPrefix: "generate-scenario-metadata",
    windowMs: 5 * 1000,
    limit: 1,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Accepted]: createOpenAPIResponse({
        description: "Scenario metadata generation enqueued",
        schema: generateScenarioMetadataResponseSchema,
      }),
    },
  }),
  validator("param", generateScenarioMetadataParamsSchema),
  async (c) => {
    const { scenarioId } = c.req.valid("param");
    const user = c.get("user");

    const foundScenario = await db.query.scenario.findFirst({
      where: (scenario, { and, eq }) =>
        and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)),
      with: {
        scenarioToPlatform: true,
      },
    });

    if (!foundScenario) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Указанный сценарий не существует или у вас нет возможности редактировать его",
      });
    }

    if (foundScenario.metadataStatus === "generation") {
      return throwAPIError({
        code: APIErrorCode.ResourceConflict,
        message: "Генерация метаданных для этого сценария уже выполняется",
      });
    }

    if (foundScenario.scenarioToPlatform.length === 0) {
      return throwAPIError({
        code: APIErrorCode.BusinessRuleViolation,
        message:
          "У сценария нет привязанных платформ, для которых можно сгенерировать метаданные",
      });
    }

    const [updatedScenario] = await db
      .update(scenario)
      .set({ metadataStatus: "pending" })
      .where(eq(scenario.id, scenarioId))
      .returning();

    await enqueueScenarioMetadataGeneration({ scenarioId });

    return c.json<GenerateScenarioMetadataResponse>(
      generateScenarioMetadataResponseSchema.parse({
        data: { metadataStatus: updatedScenario.metadataStatus },
      }),
      HTTPStatusCode.Accepted,
    );
  },
);
