import { validator } from "hono-openapi";

import { auth } from "@/auth";
import { signInEmailOtpBodySchema } from "@/domains/auth/schemas/handlers/sign-in-email-otp/body";
import {
  type SignInEmailOtpResponse,
  signInEmailOtpResponseSchema,
} from "@/domains/auth/schemas/handlers/sign-in-email-otp/response";
import { applyAuthApiHeaders } from "@/domains/auth/services/apply-auth-api-headers";
import { throwAuthAPIError } from "@/domains/auth/services/throw-auth-api-error";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const signInEmailOtpRoute = createHonoApp().basePath(
  "/auth/email-otp/sign-in",
);

// POST /api/v1/auth/email-otp/sign-in
signInEmailOtpRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "sign-in-email-otp",
    windowMs: 60 * 1000,
    limit: 3,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Auth],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Signed in successfully",
        schema: signInEmailOtpResponseSchema,
      }),
    },
  }),
  validator("json", signInEmailOtpBodySchema),
  async (c) => {
    const { isMarketingAccepted = false, ...body } = c.req.valid("json");

    try {
      const { headers, response } = await auth.api.signInEmailOTP({
        body,
        headers: c.req.raw.headers,
        returnHeaders: true,
      });

      await auth.api.updateUser({
        body: {
          marketingAccepted: isMarketingAccepted,
        },
        headers: c.req.raw.headers,
      });

      applyAuthApiHeaders(c, headers);

      return c.json<SignInEmailOtpResponse>(
        signInEmailOtpResponseSchema.parse(response),
      );
    } catch (error) {
      return throwAuthAPIError({
        error,
        fallbackMessage: "Произошла ошибка при входе в аккаунт",
      });
    }
  },
);
