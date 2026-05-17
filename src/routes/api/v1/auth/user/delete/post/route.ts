import { validator } from "hono-openapi";

import { auth } from "@/auth";
import { deleteUserBodySchema } from "@/domains/auth/schemas/handlers/delete-user/body";
import {
  type DeleteUserResponse,
  deleteUserResponseSchema,
} from "@/domains/auth/schemas/handlers/delete-user/response";
import { applyAuthApiHeaders } from "@/domains/auth/services/apply-auth-api-headers";
import { throwAuthAPIError } from "@/domains/auth/services/throw-auth-api-error";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const deleteUserRoute = createHonoApp().basePath("/auth/user/delete");

// POST /api/v1/auth/user/delete
deleteUserRoute.post(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "delete-user",
    windowMs: 60 * 1000,
    limit: 1,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Auth],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "User deletion processed successfully",
        schema: deleteUserResponseSchema,
      }),
    },
  }),
  validator("json", deleteUserBodySchema),
  async (c) => {
    const body = c.req.valid("json");

    try {
      const { headers, response } = await auth.api.deleteUser({
        body,
        headers: c.req.raw.headers,
        returnHeaders: true,
      });

      applyAuthApiHeaders(c, headers);

      return c.json<DeleteUserResponse>(
        deleteUserResponseSchema.parse(response),
      );
    } catch (error) {
      return throwAuthAPIError({
        error,
        fallbackMessage: "Произошла ошибка при удалении пользователя",
      });
    }
  },
);
