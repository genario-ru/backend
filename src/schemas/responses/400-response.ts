import { z } from "@/lib/zod";

export const badRequestResponseSchema = z.string().meta({
  title: "Bad request response",
  examples: ["Invalid request data"],
});
