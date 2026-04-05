import { zValidator } from "@hono/zod-validator";

import { processPaymentCanceledEvent } from "@/actions/billing/webhook/process-payment-canceled-event";
import { processPaymentMethodActiveEvent } from "@/actions/billing/webhook/process-payment-method-active-event";
import { processPaymentSucceededEvent } from "@/actions/billing/webhook/process-payment-succeeded-event";
import { processRefundSucceededEvent } from "@/actions/billing/webhook/process-refund-succeeded-event";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { processWebhookBodySchema } from "@/schemas/entities/billing/handlers/process-webhook/body";
import {
  type ProcessWebhookResponse,
  processWebhookResponseSchema,
} from "@/schemas/entities/billing/handlers/process-webhook/response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

export const processWebhookRoute = createHonoApp().basePath("/billing/webhook");

processWebhookRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "process-webhook",
    windowMs: 60 * 1000,
    limit: 30,
  }),
  zValidator("json", processWebhookBodySchema),
  async (c) => {
    const body = c.req.valid("json");

    switch (body.event) {
      case "payment.succeeded":
        await processPaymentSucceededEvent(body);
        break;

      case "payment.canceled":
        await processPaymentCanceledEvent(body);
        break;

      case "refund.succeeded":
        await processRefundSucceededEvent(body);
        break;

      case "payment_method.active":
        await processPaymentMethodActiveEvent(body);
        break;
    }

    return c.json<ProcessWebhookResponse>(
      processWebhookResponseSchema.parse({
        success: true,
      }),
    );
  },
);
