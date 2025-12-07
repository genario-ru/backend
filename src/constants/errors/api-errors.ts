import { APIErrorCode, APIErrorStatusCode } from "@/schemas/common/api-error";

export const APIErrorCodeToAPIErrorStatusCode: Record<
  APIErrorCode,
  APIErrorStatusCode
> = {
  [APIErrorCode.Unauthorized]: APIErrorStatusCode.Unauthorized,
  [APIErrorCode.Forbidden]: APIErrorStatusCode.Forbidden,
  [APIErrorCode.TokenExpired]: APIErrorStatusCode.TokenExpired,
  [APIErrorCode.TokenInvalid]: APIErrorStatusCode.TokenInvalid,

  [APIErrorCode.ValidationError]: APIErrorStatusCode.ValidationError,
  [APIErrorCode.InvalidInput]: APIErrorStatusCode.InvalidInput,
  [APIErrorCode.MissingRequiredField]: APIErrorStatusCode.MissingRequiredField,

  [APIErrorCode.NotFound]: APIErrorStatusCode.NotFound,
  [APIErrorCode.ResourceExists]: APIErrorStatusCode.ResourceExists,
  [APIErrorCode.ResourceConflict]: APIErrorStatusCode.ResourceConflict,

  [APIErrorCode.RateLimitExceeded]: APIErrorStatusCode.RateLimitExceeded,
  [APIErrorCode.TooManyRequests]: APIErrorStatusCode.TooManyRequests,

  [APIErrorCode.DatabaseError]: APIErrorStatusCode.DatabaseError,
  [APIErrorCode.ConnectionError]: APIErrorStatusCode.ConnectionError,
  [APIErrorCode.TransactionFailed]: APIErrorStatusCode.TransactionFailed,

  [APIErrorCode.CacheError]: APIErrorStatusCode.CacheError,
  [APIErrorCode.CacheMiss]: APIErrorStatusCode.CacheMiss,

  [APIErrorCode.FileNotFound]: APIErrorStatusCode.FileNotFound,
  [APIErrorCode.FileTooLarge]: APIErrorStatusCode.FileTooLarge,
  [APIErrorCode.InvalidFileType]: APIErrorStatusCode.InvalidFileType,
  [APIErrorCode.UploadFailed]: APIErrorStatusCode.UploadFailed,

  [APIErrorCode.ExternalServiceError]: APIErrorStatusCode.ExternalServiceError,
  [APIErrorCode.TimeoutError]: APIErrorStatusCode.TimeoutError,
  [APIErrorCode.NetworkError]: APIErrorStatusCode.NetworkError,

  [APIErrorCode.BusinessRuleViolation]:
    APIErrorStatusCode.BusinessRuleViolation,
  [APIErrorCode.InvalidOperation]: APIErrorStatusCode.InvalidOperation,
  [APIErrorCode.OperationNotAllowed]: APIErrorStatusCode.OperationNotAllowed,

  [APIErrorCode.InternalServerError]: APIErrorStatusCode.InternalServerError,
  [APIErrorCode.ServiceUnavailable]: APIErrorStatusCode.ServiceUnavailable,
  [APIErrorCode.MaintenanceMode]: APIErrorStatusCode.MaintenanceMode,
};
