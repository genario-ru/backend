import { HTTPException } from "hono/http-exception";

import { APIErrorCodeToAPIErrorStatusCode } from "@/constants/api-errors";
import { httpStatusCodeMessages } from "@/constants/http-errors";
import { APIErrorCode } from "@/schemas/common/api-error";

type ThrownAPIErrorParams = {
  code: APIErrorCode;
  message?: string;
  details?: unknown;
};

export function throwAPIError({
  code,
  message,
  details,
}: ThrownAPIErrorParams) {
  throw new HTTPException(APIErrorCodeToAPIErrorStatusCode[code], {
    message:
      message ?? httpStatusCodeMessages[APIErrorCodeToAPIErrorStatusCode[code]],
    cause: details,
  });
}
