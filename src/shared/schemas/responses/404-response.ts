import { z } from "@/lib/zod";

export const notFoundResponseSchema = z.string().meta({
  title: "Not found response",
  description: "Not found response description",
  examples: ["Resource not found"],
  ref: "NotFoundResponseSchema",
});
