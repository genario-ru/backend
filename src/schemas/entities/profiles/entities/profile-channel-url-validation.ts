import { z } from "@/lib/zod";

import { platformSchema } from "../../platforms/entities/platform";

export const profileChannelUrlValidationSchema = z
  .object({
    url: z.url(),
    status: z.enum(["error", "success"]),
    statusDetails: z.string(),
    platform: platformSchema.nullable(),
  })
  .meta({
    title: "Profile channel url validation",
    description: "Profile channel url validation description",
    ref: "ProfileChannelUrlValidationSchema",
  });

export type ProfileChannelUrlValidation = z.infer<
  typeof profileChannelUrlValidationSchema
>;
