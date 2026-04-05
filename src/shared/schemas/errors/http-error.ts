import { z } from "@/lib/zod";

export enum HTTPErrorCode {
  BadRequest = "BAD_REQUEST",
  Unauthorized = "UNAUTHORIZED",
  Forbidden = "FORBIDDEN",
  NotFound = "NOT_FOUND",
  Timeout = "TIMEOUT",
  Conflict = "CONFLICT",
  PayloadTooLarge = "PAYLOAD_TOO_LARGE",
  UnprocessableEntity = "UNPROCESSABLE_ENTITY",
  TooManyRequests = "TOO_MANY_REQUESTS",
  InternalServerError = "INTERNAL_SERVER_ERROR",
  BadGateway = "BAD_GATEWAY",
  ServiceUnavailable = "SERVICE_UNAVAILABLE",
}

export enum HTTPErrorStatusCode {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Timeout = 408,
  Conflict = 409,
  PayloadTooLarge = 413,
  UnprocessableEntity = 422,
  TooManyRequests = 429,
  InternalServerError = 500,
  BadGateway = 502,
  ServiceUnavailable = 503,
}

export const zHTTPErrorCode = z.enum(HTTPErrorCode);
export const zHTTPErrorStatusCode = z.enum(HTTPErrorStatusCode);

export type HTTPErrorCodeType = `${HTTPErrorCode}`;
export type HTTPErrorStatusCodeType = `${HTTPErrorStatusCode}`;
