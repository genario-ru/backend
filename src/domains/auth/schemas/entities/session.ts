import { createSelectSchema } from "drizzle-zod";

import { session } from "@/db/schema";
import { z } from "@/lib/zod";

export const authSessionSchema = createSelectSchema(session).meta({
  title: "Auth session",
  description: "Auth session description",
  ref: "AuthSessionSchema",
});

export type AuthSession = z.infer<typeof authSessionSchema>;
