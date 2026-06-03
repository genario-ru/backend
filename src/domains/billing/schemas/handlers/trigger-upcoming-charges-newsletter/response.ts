import { z } from "@/lib/zod";

export const triggerUpcomingChargesNewsletterResponseSchema = z
  .object({
    data: z.object({
      jobId: z.string().nullable(),
    }),
  })
  .meta({
    title: "Trigger upcoming charges newsletter response",
    description: "Trigger upcoming charges newsletter response description",
    ref: "TriggerUpcomingChargesNewsletterResponseSchema",
  });

export type TriggerUpcomingChargesNewsletterResponse = z.infer<
  typeof triggerUpcomingChargesNewsletterResponseSchema
>;
