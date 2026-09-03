import { eq, inArray } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import {
  application,
  applicationToProductFeature,
  productFeature,
} from "@/db/schema";
import { createApplicationBodySchema } from "@/domains/applications/schemas/handlers/create-application/body";
import {
  type CreateApplicationResponse,
  createApplicationResponseSchema,
} from "@/domains/applications/schemas/handlers/create-application/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const createApplicationRoute = createHonoApp().basePath("/applications");

// POST /api/v1/applications
createApplicationRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "create-application",
    windowMs: 5 * 1000,
    limit: 3,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Applications],
    responses: {
      [HTTPStatusCode.Created]: createOpenAPIResponse({
        description: "Application created successfully",
        schema: createApplicationResponseSchema,
      }),
    },
  }),
  validator("json", createApplicationBodySchema),
  async (c) => {
    const { featureIds, ...applicationParams } = c.req.valid("json");
    const uniqueFeatureIds = [...new Set(featureIds)];

    const upsertedApplication = await db.transaction(async (tx) => {
      if (uniqueFeatureIds.length > 0) {
        const foundFeatures = await tx
          .select({ id: productFeature.id })
          .from(productFeature)
          .where(inArray(productFeature.id, uniqueFeatureIds));

        if (foundFeatures.length !== uniqueFeatureIds.length) {
          throw throwAPIError({
            code: APIErrorCode.InvalidInput,
            message: "Указаны некорректные идентификаторы фичей",
          });
        }
      }

      const [upsertedApplication] = await tx
        .insert(application)
        .values(applicationParams)
        .onConflictDoUpdate({
          target: application.email,
          set: {
            comment: applicationParams.comment,
            marketingAccepted: applicationParams.marketingAccepted,
          },
        })
        .returning();

      await tx
        .delete(applicationToProductFeature)
        .where(
          eq(applicationToProductFeature.applicationId, upsertedApplication.id),
        );

      if (uniqueFeatureIds.length > 0) {
        await tx.insert(applicationToProductFeature).values(
          uniqueFeatureIds.map((productFeatureId) => ({
            applicationId: upsertedApplication.id,
            productFeatureId,
          })),
        );
      }

      return upsertedApplication;
    });

    return c.json<CreateApplicationResponse>(
      createApplicationResponseSchema.parse({
        data: upsertedApplication,
      }),
      HTTPStatusCode.Created,
    );
  },
);
