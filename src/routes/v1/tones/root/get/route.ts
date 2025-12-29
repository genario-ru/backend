import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import {
  type GetTonesResponse,
  getTonesResponseSchema,
} from "@/schemas/entities/tones/handlers/get-tones/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const getTonesRoute = createHonoApp().basePath("/tones");

// GET /api/v1/tones
getTonesRoute.get(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Tones],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Tones retrieved successfully",
        schema: getTonesResponseSchema,
      }),
    },
  }),
  async (c) => {
    const foundTones = await db.query.tone.findMany();

    return c.json<GetTonesResponse>(
      getTonesResponseSchema.parse({
        data: foundTones,
      }),
    );
  },
);
