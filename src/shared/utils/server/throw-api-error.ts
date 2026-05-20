import { HTTPException } from "hono/http-exception";

import { APIErrorCodeToAPIErrorStatusCode } from "@/shared/constants/errors/api-errors";
import { httpStatusCodeMessages } from "@/shared/constants/errors/http-errors";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";

type ThrownAPIErrorParams = {
  code: APIErrorCode;
  message?: string;
  details?: unknown;
};

export function throwAPIError({
  code,
  message: passedMessage,
  details,
}: ThrownAPIErrorParams) {
  const status = APIErrorCodeToAPIErrorStatusCode[code];
  const message = passedMessage ?? httpStatusCodeMessages[status];

  console.error(message, { code, details });

  throw new HTTPException(status, {
    message,
    cause: details,
  });
}
