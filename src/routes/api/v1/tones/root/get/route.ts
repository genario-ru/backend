import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import {
  type GetTonesResponse,
  getTonesResponseSchema,
} from "@/schemas/entities/tones/handlers/get-tones/response";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

export const getTonesRoute = createHonoApp().basePath("/tones");

// GET /api/v1/tones
getTonesRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-tones",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
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
