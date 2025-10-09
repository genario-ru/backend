import { user } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

export const userSchema = createSelectSchema(user);

export type User = z.infer<typeof userSchema>;
