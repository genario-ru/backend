import { z } from "@/lib/zod";

export enum HTTPErrorCode {
  BadRequest = "BAD_REQUEST",
  Unauthorized = "UNAUTHORIZED",
  PaymentRequired = "PAYMENT_REQUIRED",
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
  PaymentRequired = 402,
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

export const HTTPErrorCodeToHttpStatus: Record<
  HTTPErrorCode,
  HTTPErrorStatusCode
> = {
  [HTTPErrorCode.BadRequest]: HTTPErrorStatusCode.BadRequest,
  [HTTPErrorCode.Unauthorized]: HTTPErrorStatusCode.Unauthorized,
  [HTTPErrorCode.PaymentRequired]: HTTPErrorStatusCode.PaymentRequired,
  [HTTPErrorCode.Forbidden]: HTTPErrorStatusCode.Forbidden,
  [HTTPErrorCode.NotFound]: HTTPErrorStatusCode.NotFound,
  [HTTPErrorCode.Timeout]: HTTPErrorStatusCode.Timeout,
  [HTTPErrorCode.Conflict]: HTTPErrorStatusCode.Conflict,
  [HTTPErrorCode.PayloadTooLarge]: HTTPErrorStatusCode.PayloadTooLarge,
  [HTTPErrorCode.UnprocessableEntity]: HTTPErrorStatusCode.UnprocessableEntity,
  [HTTPErrorCode.TooManyRequests]: HTTPErrorStatusCode.TooManyRequests,
  [HTTPErrorCode.InternalServerError]: HTTPErrorStatusCode.InternalServerError,
  [HTTPErrorCode.BadGateway]: HTTPErrorStatusCode.BadGateway,
  [HTTPErrorCode.ServiceUnavailable]: HTTPErrorStatusCode.ServiceUnavailable,
};

export const httpStatusToHTTPErrorCode: Record<
  HTTPErrorStatusCode,
  HTTPErrorCode
> = {
  [HTTPErrorStatusCode.BadRequest]: HTTPErrorCode.BadRequest,
  [HTTPErrorStatusCode.Unauthorized]: HTTPErrorCode.Unauthorized,
  [HTTPErrorStatusCode.PaymentRequired]: HTTPErrorCode.PaymentRequired,
  [HTTPErrorStatusCode.Forbidden]: HTTPErrorCode.Forbidden,
  [HTTPErrorStatusCode.NotFound]: HTTPErrorCode.NotFound,
  [HTTPErrorStatusCode.Timeout]: HTTPErrorCode.Timeout,
  [HTTPErrorStatusCode.Conflict]: HTTPErrorCode.Conflict,
  [HTTPErrorStatusCode.PayloadTooLarge]: HTTPErrorCode.PayloadTooLarge,
  [HTTPErrorStatusCode.UnprocessableEntity]: HTTPErrorCode.UnprocessableEntity,
  [HTTPErrorStatusCode.TooManyRequests]: HTTPErrorCode.TooManyRequests,
  [HTTPErrorStatusCode.InternalServerError]: HTTPErrorCode.InternalServerError,
  [HTTPErrorStatusCode.BadGateway]: HTTPErrorCode.BadGateway,
  [HTTPErrorStatusCode.ServiceUnavailable]: HTTPErrorCode.ServiceUnavailable,
};

export type HTTPErrorCodeType = `${HTTPErrorCode}`;
export type HTTPErrorStatusCodeType = `${HTTPErrorStatusCode}`;

export const httpStatusCodeMessages: Record<HTTPErrorStatusCode, string> = {
  [HTTPErrorStatusCode.BadRequest]: "Bad Request",
  [HTTPErrorStatusCode.Unauthorized]: "Unauthorized",
  [HTTPErrorStatusCode.PaymentRequired]: "Payment Required",
  [HTTPErrorStatusCode.Forbidden]: "Forbidden",
  [HTTPErrorStatusCode.NotFound]: "Not Found",
  [HTTPErrorStatusCode.Timeout]: "Timeout",
  [HTTPErrorStatusCode.Conflict]: "Conflict",
  [HTTPErrorStatusCode.PayloadTooLarge]: "Payload Too Large",
  [HTTPErrorStatusCode.UnprocessableEntity]: "Unprocessable Entity",
  [HTTPErrorStatusCode.TooManyRequests]: "Too Many Requests",
  [HTTPErrorStatusCode.InternalServerError]: "Internal Server Error",
  [HTTPErrorStatusCode.BadGateway]: "Bad Gateway",
  [HTTPErrorStatusCode.ServiceUnavailable]: "Service Unavailable",
};
