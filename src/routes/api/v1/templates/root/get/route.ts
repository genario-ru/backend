import { db } from "@/db";
import {
  type GetTemplatesResponse,
  getTemplatesResponseSchema,
} from "@/domains/templates/schemas/handlers/get-templates/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getTemplatesRoute = createHonoApp().basePath("/templates");

// GET /api/v1/templates
getTemplatesRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-templates",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Templates],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Templates retrieved successfully",
        schema: getTemplatesResponseSchema,
      }),
    },
  }),
  async (c) => {
    const foundTemplates = await db.query.template.findMany({
      orderBy: (template, { asc }) => asc(template.name),
    });

    return c.json<GetTemplatesResponse>(
      getTemplatesResponseSchema.parse({
        data: foundTemplates,
      }),
    );
  },
);
