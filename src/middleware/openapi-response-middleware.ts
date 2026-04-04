import { describeRoute } from "hono-openapi";

import { errorResponses } from "@/constants/openapi/error-responses";
import type { OpenAPIResponses } from "@/types/openapi/openapi-responses";

type OpenAPIResponseMiddlewareParams = {
  tags: string[];
  responses: OpenAPIResponses;
  withoutDefaultResponses?: boolean;
};

export const openAPIResponseMiddleware = ({
  tags,
  responses,
  withoutDefaultResponses = false,
}: OpenAPIResponseMiddlewareParams) => {
  const defaultResponses = withoutDefaultResponses ? {} : errorResponses;

  return describeRoute({
    tags,
    responses: {
      ...defaultResponses,
      ...responses,
    },
  });
};
