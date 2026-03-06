import * as z from "zod";

export const tariffFeature = z.object({
  text: z.string(),
  included: z.boolean(),
});

export type TariffFeature = z.infer<typeof tariffFeature>;
