import { HTTPException } from "hono/http-exception";

import { APIErrorCodeToAPIErrorStatusCode } from "@/constants/shared/errors/api-errors";
import { httpStatusCodeMessages } from "@/constants/shared/errors/http-errors";
import { APIErrorCode } from "@/schemas/shared/common/api-error";

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

  throw new HTTPException(status, {
    message,
    cause: details,
  });
}
