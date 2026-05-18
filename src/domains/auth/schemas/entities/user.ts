import { createSelectSchema } from "drizzle-zod";

import { user } from "@/db/schema";
import { z } from "@/lib/zod";

export const userSchema = createSelectSchema(user)
  .extend({
    phone: z.string().nullish(),
    phoneVerified: z.boolean().optional().default(false),
    image: z.string().nullish(),
    banReason: z.string().nullish(),
    banExpires: z.coerce.string().nullish(),
    updatedAt: z.coerce.string(),
    createdAt: z.coerce.string(),
  })
  .meta({
    title: "User",
    description: "User description",
    ref: "UserSchema",
  });

export type User = z.infer<typeof userSchema>;
