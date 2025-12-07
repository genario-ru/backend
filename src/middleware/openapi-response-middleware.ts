import { describeRoute } from "hono-openapi";

import { errorResponses } from "@/constants/openapi/error-responses";
import type { OpenAPIResponses } from "@/types/openapi/openapi-responses";

type OpenAPIResponseMiddlewareParams = {
  responses: OpenAPIResponses;
  withoutDefaultResponses?: boolean;
};

export const openAPIResponseMiddleware = ({
  responses,
  withoutDefaultResponses = false,
}: OpenAPIResponseMiddlewareParams) => {
  const defaultResponses = withoutDefaultResponses ? {} : errorResponses;

  return describeRoute({
    responses: {
      ...defaultResponses,
      ...responses,
    },
  });
};
