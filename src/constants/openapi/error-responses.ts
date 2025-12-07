import { badRequestResponseSchema } from "@/schemas/responses/400-response";
import { unauthorizedResponseSchema } from "@/schemas/responses/401-response";
import { forbiddenResponseSchema } from "@/schemas/responses/403-response";
import { notFoundResponseSchema } from "@/schemas/responses/404-response";
import { internalServerErrorResponseSchema } from "@/schemas/responses/500-response";
import type { OpenAPIResponses } from "@/types/openapi/openapi-responses";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";

import { HTTPErrorStatusCode } from "../errors/http-errors";

export const unauthorizedOpenAPIResponse = createOpenAPIResponse({
  description: "Unauthorized",
  schema: unauthorizedResponseSchema,
});

export const forbiddenOpenAPIResponse = createOpenAPIResponse({
  description: "Forbidden",
  schema: forbiddenResponseSchema,
});

export const internalServerErrorOpenAPIResponse = createOpenAPIResponse({
  description: "Internal server error",
  schema: internalServerErrorResponseSchema,
});

export const badRequestOpenAPIResponse = createOpenAPIResponse({
  description: "Bad request",
  schema: badRequestResponseSchema,
});

export const notFoundOpenAPIResponse = createOpenAPIResponse({
  description: "Not found",
  schema: notFoundResponseSchema,
});

export const errorResponses: OpenAPIResponses = {
  [HTTPErrorStatusCode.BadRequest]: badRequestOpenAPIResponse,
  [HTTPErrorStatusCode.Unauthorized]: unauthorizedOpenAPIResponse,
  [HTTPErrorStatusCode.Forbidden]: forbiddenOpenAPIResponse,
  [HTTPErrorStatusCode.NotFound]: notFoundOpenAPIResponse,
  [HTTPErrorStatusCode.InternalServerError]: internalServerErrorOpenAPIResponse,
};
