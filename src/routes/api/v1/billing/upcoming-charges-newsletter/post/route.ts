import {
  type TriggerUpcomingChargesNewsletterResponse,
  triggerUpcomingChargesNewsletterResponseSchema,
} from "@/domains/billing/schemas/handlers/trigger-upcoming-charges-newsletter/response";
import { adminMiddleware } from "@/middleware/admin-middleware";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { enqueueUpcomingChargesNewsletter } from "@/mq/upcoming-charges-newsletter/queue";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const triggerUpcomingChargesNewsletterRoute = createHonoApp().basePath(
  "/billing/upcoming-charges-newsletter",
);

// POST /api/v1/billing/upcoming-charges-newsletter
triggerUpcomingChargesNewsletterRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "trigger-upcoming-charges-newsletter",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  sessionMiddleware,
  adminMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Billing],
    responses: {
      [HTTPStatusCode.Accepted]: createOpenAPIResponse({
        description: "Upcoming charges newsletter job has been enqueued",
        schema: triggerUpcomingChargesNewsletterResponseSchema,
      }),
    },
  }),
  async (c) => {
    const job = await enqueueUpcomingChargesNewsletter();

    return c.json<TriggerUpcomingChargesNewsletterResponse>(
      triggerUpcomingChargesNewsletterResponseSchema.parse({
        data: {
          jobId: job.id ?? null,
        },
      }),
      HTTPStatusCode.Accepted,
    );
  },
);
