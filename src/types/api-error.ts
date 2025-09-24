import { HTTPErrorStatusCode } from "./http-error";

export enum APIErrorCode {
  Unauthorized = "UNAUTHORIZED",
  Forbidden = "FORBIDDEN",
  TokenExpired = "TOKEN_EXPIRED",
  TokenInvalid = "TOKEN_INVALID",

  ValidationError = "VALIDATION_ERROR",
  InvalidInput = "INVALID_INPUT",
  MissingRequiredField = "MISSING_REQUIRED_FIELD",

  NotFound = "NOT_FOUND",
  ResourceExists = "RESOURCE_EXISTS",
  ResourceConflict = "RESOURCE_CONFLICT",

  RateLimitExceeded = "RATE_LIMIT_EXCEEDED",
  TooManyRequests = "TOO_MANY_REQUESTS",

  DatabaseError = "DATABASE_ERROR",
  ConnectionError = "CONNECTION_ERROR",
  TransactionFailed = "TRANSACTION_FAILED",

  CacheError = "CACHE_ERROR",
  CacheMiss = "CACHE_MISS",

  FileNotFound = "FILE_NOT_FOUND",
  FileTooLarge = "FILE_TOO_LARGE",
  InvalidFileType = "INVALID_FILE_TYPE",
  UploadFailed = "UPLOAD_FAILED",

  ExternalServiceError = "EXTERNAL_SERVICE_ERROR",
  TimeoutError = "TIMEOUT_ERROR",
  NetworkError = "NETWORK_ERROR",

  BusinessRuleViolation = "BUSINESS_RULE_VIOLATION",
  InvalidOperation = "INVALID_OPERATION",
  OperationNotAllowed = "OPERATION_NOT_ALLOWED",

  InternalServerError = "INTERNAL_SERVER_ERROR",
  ServiceUnavailable = "SERVICE_UNAVAILABLE",
  MaintenanceMode = "MAINTENANCE_MODE",
}

export enum APIErrorStatusCode {
  Unauthorized = HTTPErrorStatusCode.Unauthorized,
  Forbidden = HTTPErrorStatusCode.Forbidden,
  TokenExpired = HTTPErrorStatusCode.Unauthorized,
  TokenInvalid = HTTPErrorStatusCode.Unauthorized,

  ValidationError = HTTPErrorStatusCode.BadRequest,
  InvalidInput = HTTPErrorStatusCode.BadRequest,
  MissingRequiredField = HTTPErrorStatusCode.BadRequest,

  NotFound = HTTPErrorStatusCode.NotFound,
  ResourceExists = HTTPErrorStatusCode.Conflict,
  ResourceConflict = HTTPErrorStatusCode.Conflict,

  RateLimitExceeded = HTTPErrorStatusCode.TooManyRequests,
  TooManyRequests = HTTPErrorStatusCode.TooManyRequests,

  DatabaseError = HTTPErrorStatusCode.InternalServerError,
  ConnectionError = HTTPErrorStatusCode.ServiceUnavailable,
  TransactionFailed = HTTPErrorStatusCode.InternalServerError,

  CacheError = HTTPErrorStatusCode.InternalServerError,
  CacheMiss = HTTPErrorStatusCode.NotFound,

  FileNotFound = HTTPErrorStatusCode.NotFound,
  FileTooLarge = HTTPErrorStatusCode.PayloadTooLarge,
  InvalidFileType = HTTPErrorStatusCode.BadRequest,
  UploadFailed = HTTPErrorStatusCode.InternalServerError,

  ExternalServiceError = HTTPErrorStatusCode.BadGateway,
  TimeoutError = HTTPErrorStatusCode.Timeout,
  NetworkError = HTTPErrorStatusCode.ServiceUnavailable,

  BusinessRuleViolation = HTTPErrorStatusCode.BadRequest,
  InvalidOperation = HTTPErrorStatusCode.BadRequest,
  OperationNotAllowed = HTTPErrorStatusCode.Forbidden,

  InternalServerError = HTTPErrorStatusCode.InternalServerError,
  ServiceUnavailable = HTTPErrorStatusCode.ServiceUnavailable,
  MaintenanceMode = HTTPErrorStatusCode.ServiceUnavailable,
}
