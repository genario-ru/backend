import { createSelectSchema } from "drizzle-zod";

import { user } from "@/db/schema";
import { z } from "@/lib/zod";

import { usersRegistry } from "../registry";

export const userSchema = createSelectSchema(user).register(usersRegistry, {
  title: "User",
  description: "User description",
  ref: "UserSchema",
});

export type User = z.infer<typeof userSchema>;
