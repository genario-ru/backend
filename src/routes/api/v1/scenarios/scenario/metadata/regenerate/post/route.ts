import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { scenarioMetadata } from "@/db/schema";
import { regenerateScenarioMetadataBodySchema } from "@/domains/scenarios/schemas/handlers/regenerate-scenario-metadata/body";
import { regenerateScenarioMetadataParamsSchema } from "@/domains/scenarios/schemas/handlers/regenerate-scenario-metadata/params";
import {
  type RegenerateScenarioMetadataResponse,
  regenerateScenarioMetadataResponseSchema,
} from "@/domains/scenarios/schemas/handlers/regenerate-scenario-metadata/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { enqueueScenarioMetadataRegeneration } from "@/mq/scenario-metadata-regeneration/queue";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const regenerateScenarioMetadataRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId/metadata",
);

// POST /api/v1/scenarios/{scenarioId}/metadata/regenerate
regenerateScenarioMetadataRoute.post(
  "/regenerate",
  rateLimitMiddleware({
    keyPrefix: "regenerate-scenario-metadata",
    windowMs: 5 * 1000,
    limit: 1,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Accepted]: createOpenAPIResponse({
        description: "Scenario metadata regeneration enqueued",
        schema: regenerateScenarioMetadataResponseSchema,
      }),
    },
  }),
  validator("param", regenerateScenarioMetadataParamsSchema),
  validator("json", regenerateScenarioMetadataBodySchema),
  async (c) => {
    const { scenarioId } = c.req.valid("param");
    const { platformId, prompt } = c.req.valid("json");
    const user = c.get("user");

    const foundScenario = await db.query.scenario.findFirst({
      where: (scenario, { and, eq }) =>
        and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)),
      with: {
        scenarioToPlatform: true,
        metadata: {
          with: {
            platform: true,
          },
        },
      },
    });

    if (!foundScenario) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Указанный сценарий не существует или у вас нет доступа к нему",
      });
    }

    const foundMetadata = foundScenario.metadata.find(
      (item) => item.platformId === platformId,
    );

    if (!foundMetadata) {
      return throwAPIError({
        code: APIErrorCode.BusinessRuleViolation,
        message: "Не найдено метаданных для указанной платформы",
      });
    }

    if (foundMetadata.status === "generation") {
      return c.json<RegenerateScenarioMetadataResponse>(
        regenerateScenarioMetadataResponseSchema.parse({
          data: foundMetadata,
        }),
        HTTPStatusCode.Ok,
      );
    }

    await db
      .update(scenarioMetadata)
      .set({ status: "pending" })
      .where(eq(scenarioMetadata.id, foundMetadata.id));

    await enqueueScenarioMetadataRegeneration({
      scenarioId,
      platformId,
      prompt,
    });

    return c.json<RegenerateScenarioMetadataResponse>(
      regenerateScenarioMetadataResponseSchema.parse({
        data: {
          ...foundMetadata,
          status: "pending",
        },
      }),
      HTTPStatusCode.Ok,
    );
  },
);
