import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { validateProfileChannelBodySchema } from "@/schemas/domains/profiles/handlers/validate-profile-channel/body";
import {
  type ValidateProfileChannelResponse,
  validateProfileChannelResponseSchema,
} from "@/schemas/domains/profiles/handlers/validate-profile-channel/response";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

import { validateProfileChannel } from "../../utils";

export const validateProfileChannelRoute = createHonoApp().basePath(
  "/profiles/channels/validate",
);

// POST /api/v1/profiles/channels/validate
validateProfileChannelRoute.post(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "validate-profile-channel",
    windowMs: 60 * 1000,
    limit: 10,
  }),
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
    const validationResult = await validateProfileChannel(url);

    return c.json<ValidateProfileChannelResponse>(
      validateProfileChannelResponseSchema.parse({
        data: validationResult,
      }),
      HTTPStatusCode.Ok,
    );
  },
);
