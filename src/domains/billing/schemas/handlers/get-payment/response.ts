import { z } from "@/lib/zod";

import { paymentExtendedSchema } from "../../entities/payment";

export const getPaymentResponseSchema = z
  .object({
    data: paymentExtendedSchema,
  })
  .meta({
    title: "Get payment response",
    description: "Get payment response description",
    ref: "GetPaymentResponseSchema",
  });

export type GetPaymentResponse = z.infer<typeof getPaymentResponseSchema>;
