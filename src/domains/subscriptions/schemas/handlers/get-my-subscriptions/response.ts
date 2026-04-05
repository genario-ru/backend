import { z } from "@/lib/zod";

import { subscriptionExtendedSchema } from "../../entities/subscription";

export const getMySubscriptionsResponseSchema = z
  .object({
    data: z.array(subscriptionExtendedSchema),
  })
  .meta({
    title: "Get my subscriptions response",
    description: "Get my subscriptions response description",
    ref: "GetMySubscriptionsResponseSchema",
  });

export type GetMySubscriptionsResponse = z.infer<
  typeof getMySubscriptionsResponseSchema
>;
