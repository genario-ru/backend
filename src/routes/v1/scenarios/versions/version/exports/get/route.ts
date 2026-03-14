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
import { getScenarioVersionExportsParamsSchema } from "@/schemas/entities/scenarios/handlers/get-scenario-version-exports/params";
import {
  type GetScenarioVersionExportsResponse,
  getScenarioVersionExportsResponseSchema,
  type ScenarioVersionExportItem,
} from "@/schemas/entities/scenarios/handlers/get-scenario-version-exports/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

const scenarioVersionExportFormats = [
  { name: "PDF", format: "pdf" as const },
  { name: "DOCX", format: "docx" as const },
];

export const getScenarioVersionExportsRoute = createHonoApp().basePath(
  "/scenarios/versions/:versionId/exports",
);

// GET /api/v1/scenarios/versions/{versionId}/exports
getScenarioVersionExportsRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-scenario-version-exports",
    windowMs: 60 * 1000,
    limit: 20,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario version exports retrieved successfully",
        schema: getScenarioVersionExportsResponseSchema,
      }),
    },
  }),
  validator("param", getScenarioVersionExportsParamsSchema),
  async (c) => {
    const { versionId } = c.req.valid("param");
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
      with: {
        scenario: true,
      },
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

    const foundScenarioVersionExports =
      await db.query.scenarioVersionToExportDocument.findMany({
        where: (link, { eq }) => eq(link.scenarioVersionId, versionId),
        orderBy: (link, { desc }) => [desc(link.createdAt)],
        with: {
          exportDocument: {
            with: {
              format: true,
              attachment: true,
            },
          },
        },
      });

    const exportsData: ScenarioVersionExportItem[] = await Promise.all(
      scenarioVersionExportFormats.map(async ({ name, format }) => {
        const latestExport = foundScenarioVersionExports
          .map((item) => item.exportDocument)
          .find((item) => item.format.slug === format);

        if (!latestExport) {
          return { name, format, status: "idle" as const, url: null };
        }

        const url =
          latestExport.status === "ready" && latestExport.attachment
            ? await getSignedS3Url(latestExport.attachment.key)
            : null;

        return { name, format, status: latestExport.status, url };
      }),
    );

    return c.json<GetScenarioVersionExportsResponse>(
      getScenarioVersionExportsResponseSchema.parse({
        data: exportsData,
      }),
      HTTPStatusCode.Ok,
    );
  },
);
