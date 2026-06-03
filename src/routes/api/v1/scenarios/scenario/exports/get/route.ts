import { and, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { scenarioVersion } from "@/db/schema";
import type { ExportDocumentShort } from "@/domains/export-document/schemas/entities/export-document";
import { getScenarioExportsParamsSchema } from "@/domains/scenarios/schemas/handlers/get-scenario-exports/params";
import { getScenarioExportsQuerySchema } from "@/domains/scenarios/schemas/handlers/get-scenario-exports/query";
import {
  type GetScenarioExportsResponse,
  getScenarioExportsResponseSchema,
} from "@/domains/scenarios/schemas/handlers/get-scenario-exports/response";
import { getAttachmentDownloadUrl } from "@/lib/attachments/utils/get-attachment-download-url";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const getScenarioExportsRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId/exports",
);

// GET /api/v1/scenarios/{scenarioId}/exports
getScenarioExportsRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-scenario-exports",
    windowMs: 60 * 1000,
    limit: 30,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario exports retrieved successfully",
        schema: getScenarioExportsResponseSchema,
      }),
    },
  }),
  validator("param", getScenarioExportsParamsSchema),
  validator("query", getScenarioExportsQuerySchema),
  async (c) => {
    const { scenarioId } = c.req.valid("param");
    const { versionId } = c.req.valid("query");
    const user = c.get("user");
    const tariff = c.get("tariff");

    if (!tariff.exportAvailable) {
      return throwAPIError({
        code: APIErrorCode.Forbidden,
        message: "Экспорт сценариев не доступен по тарифу вашей подписки",
      });
    }

    const foundScenario = await db.query.scenario.findFirst({
      where: (scenario, { and, eq }) =>
        and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)),
    });

    if (!foundScenario) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Указанный сценарий не существует или у вас нет возможности экспортировать его",
      });
    }

    const scenarioVersionQueryWhereConditions = [
      eq(scenarioVersion.scenarioId, scenarioId),
    ];

    if (versionId) {
      scenarioVersionQueryWhereConditions.push(
        eq(scenarioVersion.id, versionId),
      );
    }

    const foundScenarioVersion = await db.query.scenarioVersion.findFirst({
      orderBy: (scenarioVersion, { desc }) => [desc(scenarioVersion.createdAt)],
      where: and(...scenarioVersionQueryWhereConditions),
    });

    if (!foundScenarioVersion) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Версия сценария не найдена",
      });
    }

    const foundScenarioVersionExports =
      await db.query.scenarioVersionToExportDocument.findMany({
        where: (link, { eq }) =>
          eq(link.scenarioVersionId, foundScenarioVersion.id),
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

    const foundExportDocumentFormats =
      await db.query.exportDocumentFormat.findMany();

    const exportsData: ExportDocumentShort[] = await Promise.all(
      foundExportDocumentFormats.map(async (format) => {
        const latestExport = foundScenarioVersionExports
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

    return c.json<GetScenarioExportsResponse>(
      getScenarioExportsResponseSchema.parse({
        data: exportsData,
      }),
      HTTPStatusCode.Ok,
    );
  },
);
