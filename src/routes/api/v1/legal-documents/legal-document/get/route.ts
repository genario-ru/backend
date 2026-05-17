import { validator } from "hono-openapi";

import { db } from "@/db";
import { getLegalDocumentParamsSchema } from "@/domains/legal-documents/schemas/handlers/get-legal-document/params";
import {
  type GetLegalDocumentResponse,
  getLegalDocumentResponseSchema,
} from "@/domains/legal-documents/schemas/handlers/get-legal-document/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const getLegalDocumentRoute = createHonoApp().basePath(
  "/legal-documents/:slug",
);

// GET /api/v1/legal-documents/{slug}
getLegalDocumentRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-legal-document",
    windowMs: 60 * 1000,
    limit: 20,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.LegalDocuments],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Legal document retrieved successfully",
        schema: getLegalDocumentResponseSchema,
      }),
    },
  }),
  validator("param", getLegalDocumentParamsSchema),
  async (c) => {
    const { slug } = c.req.valid("param");

    const foundLegalDocument = await db.query.legalDocument.findFirst({
      where: (legalDocument, { eq }) => eq(legalDocument.slug, slug),
    });

    if (!foundLegalDocument) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Юридический документ не найден",
      });
    }

    let markdownResponse;

    try {
      markdownResponse = await fetch(foundLegalDocument.url);
    } catch {
      return throwAPIError({
        code: APIErrorCode.InternalServerError,
        message: "Не удалось получить юридический документ из хранилища",
      });
    }

    if (!markdownResponse.ok) {
      return throwAPIError({
        code: APIErrorCode.InternalServerError,
        message:
          "Хранилище вернуло ошибку при получении юридического документа",
      });
    }

    const markdown = await markdownResponse.text();

    return c.json<GetLegalDocumentResponse>(
      getLegalDocumentResponseSchema.parse({
        data: {
          ...foundLegalDocument,
          markdown,
        },
      }),
      HTTPStatusCode.Ok,
    );
  },
);
