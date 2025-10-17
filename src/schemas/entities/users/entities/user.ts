import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { user } from "@/db/schema";

export const userSchema = createSelectSchema(user);

export type User = z.infer<typeof userSchema>;
