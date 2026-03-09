import { z } from "@/lib/zod";

export const paymentInfoSchema = z.object({
  paymentLink: z.string(),
});

export type PaymentInfo = z.infer<typeof paymentInfoSchema>;
