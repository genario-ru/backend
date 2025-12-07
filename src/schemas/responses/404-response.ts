import * as z from "zod";

export const notFoundResponseSchema = z.string().meta({
  title: "Not found response",
  examples: ["Resource not found"],
});
