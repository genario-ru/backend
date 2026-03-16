import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { getAttachmentDownloadUrl } from "@/lib/attachments/utils/get-attachment-download-url";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import type { ExportDocumentShort } from "@/schemas/entities/export-document/entities/export-document";
import { getScenarioVersionExportsParamsSchema } from "@/schemas/entities/scenarios/handlers/get-scenario-version-exports/params";
import {
  type GetScenarioVersionExportsResponse,
  getScenarioVersionExportsResponseSchema,
} from "@/schemas/entities/scenarios/handlers/get-scenario-version-exports/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

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
        scenarioVersionToExportDocument: {
          orderBy: (link, { desc }) => [desc(link.createdAt)],
          with: {
            exportDocument: {
              with: {
                format: true,
                attachment: true,
              },
            },
          },
        },
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

    const foundExportDocumentFormats =
      await db.query.exportDocumentFormat.findMany();

    const exportsData: ExportDocumentShort[] = await Promise.all(
      foundExportDocumentFormats.map(async (format) => {
        const latestExport = foundVersion.scenarioVersionToExportDocument
          .map((item) => item.exportDocument)
          .find((item) => item.format.slug === format.slug);

        if (!latestExport?.attachment) {
          return {
            formatName: format.name,
            formatSlug: format.slug,
            formatColor: format.color,
            formatIcon: format.icon,
            documentStatus: latestExport?.status ?? "idle",
            documentStatusDetails: latestExport?.statusDetails ?? null,
            documentUrl: null,
          };
        }

        const url = getAttachmentDownloadUrl(latestExport.attachment.id);

        return {
          formatName: format.name,
          formatSlug: format.slug,
          formatColor: format.color,
          formatIcon: format.icon,
          documentStatus: latestExport.status,
          documentStatusDetails: latestExport.statusDetails,
          documentUrl: url,
        };
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
