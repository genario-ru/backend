import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { user } from "@/db/schema";

import { usersRegistry } from "../registry";

export const userSchema = createSelectSchema(user).register(usersRegistry, {
  title: "User",
  description: "User description",
  ref: "UserSchema",
});

export type User = z.infer<typeof userSchema>;
