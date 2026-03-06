import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import {
  type GetTemplatesResponse,
  getTemplatesResponseSchema,
} from "@/schemas/entities/templates/handlers/get-templates/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const getTemplatesRoute = createHonoApp().basePath("/templates");

// GET /api/v1/templates
getTemplatesRoute.get(
  "/",
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
    const foundTemplates = await db.query.template.findMany();

    return c.json<GetTemplatesResponse>(
      getTemplatesResponseSchema.parse({
        data: foundTemplates,
      }),
    );
  },
);
