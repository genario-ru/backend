import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { getSignedS3Url } from "@/lib/s3/utils/get-signed-s3-url";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { getScenarioVersionExportParamsSchema } from "@/schemas/entities/scenarios/handlers/get-scenario-version-export/params";
import {
  type GetScenarioVersionExportResponse,
  getScenarioVersionExportResponseSchema,
} from "@/schemas/entities/scenarios/handlers/get-scenario-version-export/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const getScenarioVersionExportRoute = createHonoApp().basePath(
  "/scenarios/versions/:versionId/exports/:exportId",
);

// GET /api/v1/scenarios/versions/{versionId}/exports/{exportId}
getScenarioVersionExportRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-scenario-version-export",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario version export retrieved successfully",
        schema: getScenarioVersionExportResponseSchema,
      }),
    },
  }),
  validator("param", getScenarioVersionExportParamsSchema),
  async (c) => {
    const { versionId, exportId } = c.req.valid("param");
    const user = c.get("user");

    const foundScenarioVersionExport =
      await db.query.scenarioVersionExport.findFirst({
        where: (scenarioVersionExport, { eq, and }) =>
          and(
            eq(scenarioVersionExport.id, exportId),
            eq(scenarioVersionExport.userId, user.id),
            eq(scenarioVersionExport.scenarioVersionId, versionId),
          ),
        with: {
          attachment: true,
        },
      });

    if (!foundScenarioVersionExport) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Экспорт версии сценария не найден",
      });
    }

    return c.json<GetScenarioVersionExportResponse>(
      getScenarioVersionExportResponseSchema.parse({
        data: {
          ...foundScenarioVersionExport,
          url: foundScenarioVersionExport.attachment
            ? await getSignedS3Url(foundScenarioVersionExport.attachment.key)
            : null,
        },
      }),
      HTTPStatusCode.Ok,
    );
  },
);
