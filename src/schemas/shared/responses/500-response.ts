import { z } from "@/lib/zod";

export const internalServerErrorResponseSchema = z.string().meta({
  title: "Internal server error response",
  description: "Internal server error response description",
  examples: ["You have to authenticate to access this resource"],
  ref: "InternalServerErrorResponseSchema",
});
