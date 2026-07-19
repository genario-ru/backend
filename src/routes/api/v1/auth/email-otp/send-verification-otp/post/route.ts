import { validator } from "hono-openapi";

import { auth } from "@/auth";
import { sendVerificationOtpBodySchema } from "@/domains/auth/schemas/handlers/send-verification-otp/body";
import {
  type SendVerificationOtpResponse,
  sendVerificationOtpResponseSchema,
} from "@/domains/auth/schemas/handlers/send-verification-otp/response";
import { throwAuthAPIError } from "@/domains/auth/services/throw-auth-api-error";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const sendVerificationOtpRoute = createHonoApp().basePath(
  "/auth/email-otp/send-verification-otp",
);

// POST /api/v1/auth/email-otp/send-verification-otp
sendVerificationOtpRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "send-verification-otp",
    windowMs: 60 * 1000,
    limit: 3,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Auth],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Verification OTP sent successfully",
        schema: sendVerificationOtpResponseSchema,
      }),
    },
  }),
  validator("json", sendVerificationOtpBodySchema),
  async (c) => {
    const body = c.req.valid("json");

    try {
      const response = await auth.api.sendVerificationOTP({
        body,
        headers: c.req.raw.headers,
      });

      return c.json<SendVerificationOtpResponse>(
        sendVerificationOtpResponseSchema.parse(response),
      );
    } catch (error) {
      throw throwAuthAPIError({
        error,
        fallbackMessage: "Произошла ошибка при отправке кода подтверждения",
      });
    }
  },
);
