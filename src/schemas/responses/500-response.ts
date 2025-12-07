import * as z from "zod";

export const internalServerErrorResponseSchema = z.string().meta({
  title: "Internal server error response",
  examples: ["You have to authenticate to access this resource"],
});
