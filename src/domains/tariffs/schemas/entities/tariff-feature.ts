import { z } from "@/lib/zod";

export const tariffFeature = z.object({
  text: z.string(),
  included: z.boolean(),
});

export type TariffFeature = z.infer<typeof tariffFeature>;
