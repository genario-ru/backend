import { z } from "@/lib/zod";

export const profileGeneratedSchema = z.object({
  name: z.string(),
  description: z.string(),
  targetAudience: z.string(),
  toneIds: z.array(z.uuid()),
});

export type ProfileGenerated = z.infer<typeof profileGeneratedSchema>;
