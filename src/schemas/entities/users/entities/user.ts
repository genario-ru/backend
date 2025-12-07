import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { user } from "@/db/schema";

export const userSchema = createSelectSchema(user).meta({
  title: "User",
  description: "User description",
  ref: "UserSchema",
});

export type User = z.infer<typeof userSchema>;
