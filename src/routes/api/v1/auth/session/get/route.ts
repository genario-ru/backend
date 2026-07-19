import { auth } from "@/auth";
import {
  type GetSessionResponse,
  getSessionResponseSchema,
} from "@/domains/auth/schemas/handlers/get-session/response";
import { throwAuthAPIError } from "@/domains/auth/services/throw-auth-api-error";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getSessionRoute = createHonoApp().basePath("/auth/session");

// GET /api/v1/auth/session
getSessionRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-session",
    windowMs: 1000,
    limit: 2,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Auth],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Session retrieved successfully",
        schema: getSessionResponseSchema,
      }),
    },
  }),
  async (c) => {
    try {
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });

      return c.json<GetSessionResponse>(
        getSessionResponseSchema.parse(session),
      );
    } catch (error) {
      throw throwAuthAPIError({
        error,
        fallbackMessage: "Произошла ошибка при получении сессии",
      });
    }
  },
);
