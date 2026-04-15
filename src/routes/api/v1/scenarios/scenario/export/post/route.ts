import { and, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import {
  exportDocument,
  scenarioVersion,
  scenarioVersionToExportDocument,
} from "@/db/schema";
import { createScenarioExportParamsSchema } from "@/domains/scenarios/schemas/handlers/create-scenario-export/params";
import { createScenarioExportQuerySchema } from "@/domains/scenarios/schemas/handlers/create-scenario-export/query";
import {
  type CreateScenarioExportResponse,
  createScenarioExportResponseSchema,
} from "@/domains/scenarios/schemas/handlers/create-scenario-export/response";
import { getAttachmentDownloadUrl } from "@/lib/attachments/utils/get-attachment-download-url";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { enqueueScenarioVersionExport } from "@/mq/scenario-version-export/queue";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const createScenarioExportRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId/export",
);

// POST /api/v1/scenarios/{scenarioId}/export
createScenarioExportRoute.post(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "create-scenario-export",
    windowMs: 60 * 1000,
    limit: 20,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario export created successfully",
        schema: createScenarioExportResponseSchema,
      }),
    },
  }),
  validator("param", createScenarioExportParamsSchema),
  validator("query", createScenarioExportQuerySchema),
  async (c) => {
    const { scenarioId } = c.req.valid("param");
    const { versionId, format } = c.req.valid("query");
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
        message: "Указанная версия сценария не существует",
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
          scenarioVersionId: foundScenarioVersion.id,
          exportDocumentId: createdExportDocument.id,
        });

        return createdExportDocument;
      });

      await enqueueScenarioVersionExport({
        scenarioVersionId: foundScenarioVersion.id,
        exportDocumentId: createdExportDocument.id,
      });

      return c.json<CreateScenarioExportResponse>(
        createScenarioExportResponseSchema.parse({
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
        scenarioVersionId: foundScenarioVersion.id,
      });

      return c.json<CreateScenarioExportResponse>(
        createScenarioExportResponseSchema.parse({
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

      return c.json<CreateScenarioExportResponse>(
        createScenarioExportResponseSchema.parse({
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

    return c.json<CreateScenarioExportResponse>(
      createScenarioExportResponseSchema.parse({
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
