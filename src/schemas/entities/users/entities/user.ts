import { createSelectSchema } from "drizzle-zod";

import { user } from "@/db/schema";
import { z } from "@/lib/zod";

export const userSchema = createSelectSchema(user).meta({
  title: "User",
  description: "User description",
  ref: "UserSchema",
});

export type User = z.infer<typeof userSchema>;
