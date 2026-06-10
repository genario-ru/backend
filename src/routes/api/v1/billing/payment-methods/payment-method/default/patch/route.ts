import { validator } from "hono-openapi";

import { selectDefaultPaymentMethodParamsSchema } from "@/domains/billing/schemas/handlers/select-default-payment-method/params";
import {
  type SelectDefaultPaymentMethodResponse,
  selectDefaultPaymentMethodResponseSchema,
} from "@/domains/billing/schemas/handlers/select-default-payment-method/response";
import { selectDefaultPaymentMethod } from "@/domains/billing/services/select-default-payment-method";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const selectDefaultPaymentMethodRoute = createHonoApp().basePath(
  "/billing/payment-methods/:paymentMethodId",
);

// PATCH /api/v1/billing/payment-methods/{paymentMethodId}/default
selectDefaultPaymentMethodRoute.patch(
  "/default",
  rateLimitMiddleware({
    keyPrefix: "select-default-payment-method",
    windowMs: 1000,
    limit: 1,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Billing],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Default payment method selected successfully",
        schema: selectDefaultPaymentMethodResponseSchema,
      }),
    },
  }),
  validator("param", selectDefaultPaymentMethodParamsSchema),
  async (c) => {
    const user = c.get("user");
    const { paymentMethodId } = c.req.valid("param");

    const updatedPaymentMethod = await selectDefaultPaymentMethod({
      userId: user.id,
      paymentMethodId,
    });

    return c.json<SelectDefaultPaymentMethodResponse>(
      selectDefaultPaymentMethodResponseSchema.parse({
        data: updatedPaymentMethod,
      }),
    );
  },
);
