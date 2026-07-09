import { auth } from "@/auth";
import {
  type SignOutResponse,
  signOutResponseSchema,
} from "@/domains/auth/schemas/handlers/sign-out/response";
import { applyAuthApiHeaders } from "@/domains/auth/services/apply-auth-api-headers";
import { throwAuthAPIError } from "@/domains/auth/services/throw-auth-api-error";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const signOutRoute = createHonoApp().basePath("/auth/sign-out");

// POST /api/v1/auth/sign-out
signOutRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "sign-out",
    windowMs: 3 * 1000,
    limit: 1,
  }),
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Auth],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Signed out successfully",
        schema: signOutResponseSchema,
      }),
    },
  }),
  async (c) => {
    try {
      const { headers, response } = await auth.api.signOut({
        headers: c.req.raw.headers,
        returnHeaders: true,
      });

      applyAuthApiHeaders(c, headers);

      return c.json<SignOutResponse>(signOutResponseSchema.parse(response));
    } catch (error) {
      throw throwAuthAPIError({
        error,
        fallbackMessage: "Произошла ошибка при выходе из аккаунта",
      });
    }
  },
);
