import { z } from "@/lib/zod";

import { platformSchema } from "../../platforms/entities/platform";

const profileChannelUrlSuccessValidationSchema = z.object({
  url: z.url(),
  status: z.literal("success"),
  statusDetails: z.string(),
  platform: platformSchema,
});

const profileChannelUrlErrorValidationSchema = z.object({
  url: z.url(),
  status: z.literal("error"),
  statusDetails: z.string(),
  platform: platformSchema.nullable(),
});

export const profileChannelUrlValidationSchema = z
  .union([
    profileChannelUrlSuccessValidationSchema,
    profileChannelUrlErrorValidationSchema,
  ])
  .meta({
    title: "Profile channel url validation",
    description: "Profile channel url validation description",
    ref: "ProfileChannelUrlValidationSchema",
  });

export type ProfileChannelUrlValidation = z.infer<
  typeof profileChannelUrlValidationSchema
>;
