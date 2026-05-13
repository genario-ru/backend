import { zValidator } from "@hono/zod-validator";

import { processWebhookBodySchema } from "@/domains/billing/schemas/handlers/process-webhook/body";
import {
  type ProcessWebhookResponse,
  processWebhookResponseSchema,
} from "@/domains/billing/schemas/handlers/process-webhook/response";
import { processPaymentCanceledEvent } from "@/domains/billing/services/process-payment-canceled-event";
import { processPaymentMethodActiveEvent } from "@/domains/billing/services/process-payment-method-active-event";
import { processPaymentSucceededEvent } from "@/domains/billing/services/process-payment-succeeded-event";
import { processRefundSucceededEvent } from "@/domains/billing/services/process-refund-succeeded-event";
import { verifyWebhook } from "@/domains/billing/services/verify-webhook";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

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

    await verifyWebhook(body);

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
