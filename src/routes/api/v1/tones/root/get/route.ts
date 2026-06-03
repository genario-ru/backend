import { db } from "@/db";
import {
  type GetTonesResponse,
  getTonesResponseSchema,
} from "@/domains/tones/schemas/handlers/get-tones/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getTonesRoute = createHonoApp().basePath("/tones");

// GET /api/v1/tones
getTonesRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-tones",
    windowMs: 60 * 1000,
    limit: 30,
  }),
  sessionMiddleware,
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
    const foundTones = await db.query.tone.findMany({
      orderBy: (tone, { asc, desc }) => [desc(tone.priority), asc(tone.name)],
    });

    return c.json<GetTonesResponse>(
      getTonesResponseSchema.parse({
        data: foundTones,
      }),
    );
  },
);
