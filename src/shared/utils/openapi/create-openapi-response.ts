import { resolver } from "hono-openapi";
import type * as z from "zod";

import type { OpenAPIResponse } from "@/shared/types/openapi/openapi-responses";

type CreateOpenAPIResponseParams = {
  description: string;
  schema: z.ZodSchema;
};

export function createOpenAPIResponse({
  description,
  schema,
}: CreateOpenAPIResponseParams): OpenAPIResponse {
  return {
    description,
    content: {
      "application/json": {
        schema: resolver(schema),
      },
    },
  };
}
