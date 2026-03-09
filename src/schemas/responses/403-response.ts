import { z } from "@/lib/zod";

export const forbiddenResponseSchema = z.string().meta({
  title: "Forbidden response",
  examples: ["You are not authorized to access this resource"],
});
