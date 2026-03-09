import { z } from "@/lib/zod";

export const unauthorizedResponseSchema = z.string().meta({
  title: "Unauthorized response",
  description: "Unauthorized response description",
  examples: ["You have to authenticate to access this resource"],
  ref: "UnauthorizedResponseSchema",
});
