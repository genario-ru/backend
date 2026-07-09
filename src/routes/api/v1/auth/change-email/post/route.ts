import { validator } from "hono-openapi";

import { auth } from "@/auth";
import { changeEmailBodySchema } from "@/domains/auth/schemas/handlers/change-email/body";
import {
  type ChangeEmailResponse,
  changeEmailResponseSchema,
} from "@/domains/auth/schemas/handlers/change-email/response";
import { throwAuthAPIError } from "@/domains/auth/services/throw-auth-api-error";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const changeEmailRoute = createHonoApp().basePath("/auth/change-email");

// POST /api/v1/auth/change-email
changeEmailRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "change-email",
    windowMs: 60 * 1000,
    limit: 3,
  }),
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Auth],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Email change request processed successfully",
        schema: changeEmailResponseSchema,
      }),
    },
  }),
  validator("json", changeEmailBodySchema),
  async (c) => {
    const body = c.req.valid("json");

    try {
      const response = await auth.api.changeEmail({
        body,
        headers: c.req.raw.headers,
      });

      return c.json<ChangeEmailResponse>(
        changeEmailResponseSchema.parse(response),
      );
    } catch (error) {
      throw throwAuthAPIError({
        error,
        fallbackMessage: "Произошла ошибка при смене email",
      });
    }
  },
);
