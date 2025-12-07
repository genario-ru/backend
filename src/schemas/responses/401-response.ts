import * as z from "zod";

export const unauthorizedResponseSchema = z.string().meta({
  title: "Unauthorized response",
  examples: ["You have to authenticate to access this resource"],
});
