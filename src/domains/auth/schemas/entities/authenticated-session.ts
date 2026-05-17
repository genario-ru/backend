import { z } from "@/lib/zod";

import { authSessionSchema } from "./session";
import { userSchema } from "./user";

export const authenticatedSessionSchema = z
  .object({
    session: authSessionSchema,
    user: userSchema,
  })
  .meta({
    title: "Authenticated session",
    description: "Authenticated session description",
    ref: "AuthenticatedSessionSchema",
  });

export type AuthenticatedSession = z.infer<typeof authenticatedSessionSchema>;
