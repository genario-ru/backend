import {
  type TriggerTerminateExpiredCreditsBatchesResponse,
  triggerTerminateExpiredCreditsBatchesResponseSchema,
} from "@/domains/billing/schemas/handlers/trigger-terminate-expired-credits-batches/response";
import { adminMiddleware } from "@/middleware/admin-middleware";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { enqueueTerminateExpiredCreditsBatches } from "@/mq/terminate-expired-credits-batches/queue";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const triggerTerminateExpiredCreditsBatchesRoute =
  createHonoApp().basePath("/billing/terminate-expired-credits-batches");

// POST /api/v1/billing/terminate-expired-credits-batches
triggerTerminateExpiredCreditsBatchesRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "trigger-terminate-expired-credits-batches",
    windowMs: 5 * 1000,
    limit: 1,
  }),
  sessionMiddleware,
  adminMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Billing],
    responses: {
      [HTTPStatusCode.Accepted]: createOpenAPIResponse({
        description:
          "Expired credits batches termination job has been enqueued",
        schema: triggerTerminateExpiredCreditsBatchesResponseSchema,
      }),
    },
  }),
  async (c) => {
    const job = await enqueueTerminateExpiredCreditsBatches();

    return c.json<TriggerTerminateExpiredCreditsBatchesResponse>(
      triggerTerminateExpiredCreditsBatchesResponseSchema.parse({
        data: {
          jobId: job.id ?? null,
        },
      }),
      HTTPStatusCode.Accepted,
    );
  },
);
