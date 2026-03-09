import { z } from "@/lib/zod";

export const notFoundResponseSchema = z.string().meta({
  title: "Not found response",
  examples: ["Resource not found"],
});
