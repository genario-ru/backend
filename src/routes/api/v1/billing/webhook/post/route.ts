import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { processWebhookBodySchema } from "@/schemas/entities/billing/handlers/process-webhook/body";
import {
  type ProcessWebhookResponse,
  processWebhookResponseSchema,
} from "@/schemas/entities/billing/handlers/process-webhook/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const processWebhookRoute = createHonoApp().basePath("/billing/webhook");

processWebhookRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "process-webhook",
    windowMs: 60 * 1000,
    limit: 30,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Billing],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Webhook processed successfully",
        schema: processWebhookResponseSchema,
      }),
    },
  }),
  validator("json", processWebhookBodySchema),
  async (c) => {
    const body = c.req.valid("json");

    console.log("Processing webhook:", body.event);

    return c.json<ProcessWebhookResponse>(
      processWebhookResponseSchema.parse({
        success: true,
      }),
      HTTPStatusCode.Ok,
    );
  },
);
