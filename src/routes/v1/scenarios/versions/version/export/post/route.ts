import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { scenarioVersionExport } from "@/db/schema";
import { getSignedS3Url } from "@/lib/s3/utils/get-signed-s3-url";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { enqueueScenarioVersionExport } from "@/mq/scenario/scenario-version-export/queue";
import { APIErrorCode } from "@/schemas/common/api-error";
import { getScenarioVersionExportBodySchema } from "@/schemas/entities/scenarios/handlers/get-scenario-version-export/body";
import { getScenarioVersionExportParamsSchema } from "@/schemas/entities/scenarios/handlers/get-scenario-version-export/params";
import {
  type GetScenarioVersionExportResponse,
  getScenarioVersionExportResponseSchema,
} from "@/schemas/entities/scenarios/handlers/get-scenario-version-export/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const getScenarioVersionExportRoute = createHonoApp().basePath(
  "/scenarios/versions/:versionId/export",
);

// POST /api/v1/scenarios/versions/{versionId}/export
getScenarioVersionExportRoute.post(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "post-scenario-version-export",
    windowMs: 60 * 1000,
    limit: 20,
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
  validator("json", getScenarioVersionExportBodySchema),
  async (c) => {
    const { versionId } = c.req.valid("param");
    const { format } = c.req.valid("json");
    const user = c.get("user");
    const tariff = c.get("tariff");

    if (!tariff.exportAvailable) {
      return throwAPIError({
        code: APIErrorCode.Forbidden,
        message: "Экспорт сценариев не доступен по тарифу вашей подписки",
      });
    }

    const foundVersion = await db.query.scenarioVersion.findFirst({
      where: (scenarioVersion, { eq }) => eq(scenarioVersion.id, versionId),
      with: { scenario: true },
    });

    if (!foundVersion) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Версия сценария не найдена",
      });
    }

    if (foundVersion.scenario.userId !== user.id) {
      return throwAPIError({
        code: APIErrorCode.Forbidden,
        message:
          "Данный сценарий не существует или у вас нет возможности экспортировать его",
      });
    }

    const foundScenarioVersionExport =
      await db.query.scenarioVersionExport.findFirst({
        where: (scenarioVersionExport, { eq, and }) =>
          and(
            eq(scenarioVersionExport.userId, user.id),
            eq(scenarioVersionExport.scenarioVersionId, versionId),
            eq(scenarioVersionExport.format, format),
          ),
        orderBy: (scenarioVersionExport, { desc }) => [
          desc(scenarioVersionExport.createdAt),
        ],
        with: {
          attachment: true,
        },
      });

    if (!foundScenarioVersionExport) {
      const [createdScenarioVersionExport] = await db
        .insert(scenarioVersionExport)
        .values({
          userId: user.id,
          scenarioVersionId: versionId,
          format,
        })
        .returning();

      await enqueueScenarioVersionExport({
        scenarioVersionExportId: createdScenarioVersionExport.id,
      });

      return c.json<GetScenarioVersionExportResponse>(
        getScenarioVersionExportResponseSchema.parse({
          data: {
            ...createdScenarioVersionExport,
            url: null,
          },
        }),
        HTTPStatusCode.Ok,
      );
    }

    const { attachment: _attachment, ...preparedScenarioVersionExport } =
      foundScenarioVersionExport;

    if (
      foundScenarioVersionExport.status === "ready" &&
      foundScenarioVersionExport.attachment
    ) {
      const url = await getSignedS3Url(
        foundScenarioVersionExport.attachment.key,
      );

      return c.json<GetScenarioVersionExportResponse>(
        getScenarioVersionExportResponseSchema.parse({
          data: {
            ...preparedScenarioVersionExport,
            url,
          },
        }),
        HTTPStatusCode.Ok,
      );
    }

    return c.json<GetScenarioVersionExportResponse>(
      getScenarioVersionExportResponseSchema.parse({
        data: {
          ...preparedScenarioVersionExport,
          url: null,
        },
      }),
      HTTPStatusCode.Ok,
    );
  },
);
