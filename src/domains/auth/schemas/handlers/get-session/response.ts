import { z } from "@/lib/zod";

import { authenticatedSessionSchema } from "../../entities/authenticated-session";

export const getSessionResponseSchema = authenticatedSessionSchema
  .nullable()
  .meta({
    title: "Get session response",
    description: "Get session response description",
    ref: "GetSessionResponseSchema",
  });

export type GetSessionResponse = z.infer<typeof getSessionResponseSchema>;
