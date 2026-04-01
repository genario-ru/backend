import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { exportDocument, scenarioVersionToExportDocument } from "@/db/schema";
import { getAttachmentDownloadUrl } from "@/lib/attachments/utils/get-attachment-download-url";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { enqueueScenarioVersionExport } from "@/mq/scenario-version-export/queue";
import { APIErrorCode } from "@/schemas/common/api-error";
import { getScenarioVersionExportBodySchema } from "@/schemas/entities/scenarios/handlers/create-scenario-version-export/body";
import { getScenarioVersionExportParamsSchema } from "@/schemas/entities/scenarios/handlers/create-scenario-version-export/params";
import {
  type GetScenarioVersionExportResponse,
  getScenarioVersionExportResponseSchema,
} from "@/schemas/entities/scenarios/handlers/create-scenario-version-export/response";
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
        message: "У вас нет возможности экспортировать этот сценарий",
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

    const foundExportDocument = foundScenarioVersionExports
      .map((item) => item.exportDocument)
      .find((item) => item.format.slug === format);

    if (!foundExportDocument) {
      const foundFormat = await db.query.exportDocumentFormat.findFirst({
        where: (documentFormat, { eq }) => eq(documentFormat.slug, format),
      });

      if (!foundFormat) {
        return throwAPIError({
          code: APIErrorCode.InternalServerError,
          message: `Формат экспорта '${format}' не настроен в таблице export_document_format`,
        });
      }

      const createdExportDocument = await db.transaction(async (tx) => {
        const [createdExportDocument] = await tx
          .insert(exportDocument)
          .values({
            userId: user.id,
            formatId: foundFormat.id,
          })
          .returning();

        await tx.insert(scenarioVersionToExportDocument).values({
          scenarioVersionId: versionId,
          exportDocumentId: createdExportDocument.id,
        });

        return createdExportDocument;
      });

      await enqueueScenarioVersionExport({
        exportDocumentId: createdExportDocument.id,
        scenarioVersionId: versionId,
      });

      return c.json<GetScenarioVersionExportResponse>(
        getScenarioVersionExportResponseSchema.parse({
          data: {
            formatName: foundFormat.name,
            formatSlug: foundFormat.slug,
            formatColor: foundFormat.color,
            formatIcon: foundFormat.icon,
            documentStatus: createdExportDocument.status,
            documentStatusDetails: createdExportDocument.statusDetails,
            documentUrl: null,
          },
        }),
        HTTPStatusCode.Created,
      );
    }

    if (foundExportDocument.status === "failed") {
      const [updatedExportDocument] = await db
        .update(exportDocument)
        .set({
          status: "pending",
          statusDetails: null,
        })
        .where(eq(exportDocument.id, foundExportDocument.id))
        .returning();

      await enqueueScenarioVersionExport({
        exportDocumentId: foundExportDocument.id,
        scenarioVersionId: versionId,
      });

      return c.json<GetScenarioVersionExportResponse>(
        getScenarioVersionExportResponseSchema.parse({
          data: {
            formatName: foundExportDocument.format.name,
            formatSlug: foundExportDocument.format.slug,
            formatColor: foundExportDocument.format.color,
            formatIcon: foundExportDocument.format.icon,
            documentStatus: updatedExportDocument.status,
            documentStatusDetails: updatedExportDocument.statusDetails,
            documentUrl: null,
          },
        }),
        HTTPStatusCode.Ok,
      );
    }

    if (
      foundExportDocument.status === "ready" &&
      foundExportDocument.attachment
    ) {
      const url = getAttachmentDownloadUrl(foundExportDocument.attachment.id);

      return c.json<GetScenarioVersionExportResponse>(
        getScenarioVersionExportResponseSchema.parse({
          data: {
            formatName: foundExportDocument.format.name,
            formatSlug: foundExportDocument.format.slug,
            formatColor: foundExportDocument.format.color,
            formatIcon: foundExportDocument.format.icon,
            documentStatus: foundExportDocument.status,
            documentStatusDetails: foundExportDocument.statusDetails,
            documentUrl: url,
          },
        }),
        HTTPStatusCode.Ok,
      );
    }

    return c.json<GetScenarioVersionExportResponse>(
      getScenarioVersionExportResponseSchema.parse({
        data: {
          formatName: foundExportDocument.format.name,
          formatSlug: foundExportDocument.format.slug,
          formatColor: foundExportDocument.format.color,
          formatIcon: foundExportDocument.format.icon,
          documentStatus: foundExportDocument.status,
          documentStatusDetails: foundExportDocument.statusDetails,
          documentUrl: null,
        },
      }),
      HTTPStatusCode.Ok,
    );
  },
);
