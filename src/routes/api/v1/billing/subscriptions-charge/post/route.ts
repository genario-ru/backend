import {
  type TriggerSubscriptionsChargeResponse,
  triggerSubscriptionsChargeResponseSchema,
} from "@/domains/billing/schemas/handlers/trigger-subscriptions-charge/response";
import { adminMiddleware } from "@/middleware/admin-middleware";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { enqueueSubscriptionsCharge } from "@/mq/subscriptions-charge/queue";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const triggerSubscriptionsChargeRoute = createHonoApp().basePath(
  "/billing/subscriptions-charge",
);

// POST /api/v1/billing/subscriptions-charge
triggerSubscriptionsChargeRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "trigger-subscriptions-charge",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  sessionMiddleware,
  adminMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Billing],
    responses: {
      [HTTPStatusCode.Accepted]: createOpenAPIResponse({
        description: "Subscriptions charge job has been enqueued",
        schema: triggerSubscriptionsChargeResponseSchema,
      }),
    },
  }),
  async (c) => {
    const job = await enqueueSubscriptionsCharge();

    return c.json<TriggerSubscriptionsChargeResponse>(
      triggerSubscriptionsChargeResponseSchema.parse({
        data: {
          jobId: job.id ?? null,
        },
      }),
      HTTPStatusCode.Accepted,
    );
  },
);
