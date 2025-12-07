import type { describeRoute } from "hono-openapi";

export type OpenAPIResponses = Parameters<typeof describeRoute>[0]["responses"];

export type OpenAPIResponse = NonNullable<OpenAPIResponses>[string];
