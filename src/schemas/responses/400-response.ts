import * as z from "zod";

export const badRequestResponseSchema = z.string().meta({
  title: "Bad request response",
  examples: ["Invalid request data"],
});
