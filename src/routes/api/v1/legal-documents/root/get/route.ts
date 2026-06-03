import { db } from "@/db";
import {
  type GetLegalDocumentsResponse,
  getLegalDocumentsResponseSchema,
} from "@/domains/legal-documents/schemas/handlers/get-legal-documents/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getLegalDocumentsRoute =
  createHonoApp().basePath("/legal-documents");

// GET /api/v1/legal-documents
getLegalDocumentsRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-legal-documents",
    windowMs: 60 * 1000,
    limit: 30,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.LegalDocuments],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Legal documents retrieved successfully",
        schema: getLegalDocumentsResponseSchema,
      }),
    },
  }),
  async (c) => {
    const foundLegalDocuments = await db.query.legalDocument.findMany({
      orderBy: (legalDocument, { asc }) => [asc(legalDocument.title)],
    });

    return c.json<GetLegalDocumentsResponse>(
      getLegalDocumentsResponseSchema.parse({
        data: foundLegalDocuments,
      }),
      HTTPStatusCode.Ok,
    );
  },
);
