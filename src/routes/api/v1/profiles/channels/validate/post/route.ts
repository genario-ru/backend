import { validator } from "hono-openapi";

import { validateProfileChannelBodySchema } from "@/domains/profiles/schemas/handlers/validate-profile-channel/body";
import {
  type ValidateProfileChannelResponse,
  validateProfileChannelResponseSchema,
} from "@/domains/profiles/schemas/handlers/validate-profile-channel/response";
import { validateProfileChannel } from "@/domains/profiles/services/validate-profile-channel";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const validateProfileChannelRoute = createHonoApp().basePath(
  "/profiles/channels/validate",
);

// POST /api/v1/profiles/channels/validate
validateProfileChannelRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "validate-profile-channel",
    windowMs: 2 * 1000,
    limit: 1,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Profiles],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Profile channel validated successfully",
        schema: validateProfileChannelResponseSchema,
      }),
    },
  }),
  validator("json", validateProfileChannelBodySchema),
  async (c) => {
    const { url } = c.req.valid("json");
    const validationResult = await validateProfileChannel({ url });

    return c.json<ValidateProfileChannelResponse>(
      validateProfileChannelResponseSchema.parse({
        data: validationResult,
      }),
      HTTPStatusCode.Ok,
    );
  },
);
