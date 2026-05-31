import { z } from "@/lib/zod";

export const upcomingSubscriptionChargePayloadSchema = z.object({
  chargeAt: z.string().datetime(),
  daysBeforeCharge: z.union([z.literal(3), z.literal(1)]),
  tariffName: z.string().min(1),
  tariffPrice: z.number().nonnegative(),
});

export type UpcomingSubscriptionChargePayload = z.infer<
  typeof upcomingSubscriptionChargePayloadSchema
>;
