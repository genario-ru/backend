import { z } from "@/lib/zod";

export const badRequestResponseSchema = z.string().meta({
  title: "Bad request response",
  description: "Bad request response description",
  examples: ["Invalid request data"],
  ref: "BadRequestResponseSchema",
});
