import { validator } from "hono-openapi";

import { auth } from "@/auth";
import { updateUserBodySchema } from "@/domains/auth/schemas/handlers/update-user/body";
import {
  type UpdateUserResponse,
  updateUserResponseSchema,
} from "@/domains/auth/schemas/handlers/update-user/response";
import { throwAuthAPIError } from "@/domains/auth/services/throw-auth-api-error";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const updateUserRoute = createHonoApp().basePath("/auth/user");

// PATCH /api/v1/auth/user
updateUserRoute.patch(
  "/",
  rateLimitMiddleware({
    keyPrefix: "update-user",
    windowMs: 3 * 1000,
    limit: 1,
  }),
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Auth],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "User updated successfully",
        schema: updateUserResponseSchema,
      }),
    },
  }),
  validator("json", updateUserBodySchema),
  async (c) => {
    const body = c.req.valid("json");

    try {
      const response = await auth.api.updateUser({
        body,
        headers: c.req.raw.headers,
      });

      return c.json<UpdateUserResponse>(
        updateUserResponseSchema.parse(response),
      );
    } catch (error) {
      throw throwAuthAPIError({
        error,
        fallbackMessage: "Произошла ошибка при обновлении пользователя",
      });
    }
  },
);
