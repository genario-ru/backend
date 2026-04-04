import { describeRoute } from "hono-openapi";

import { envs } from "@/constants/common/envs";
import { errorResponses } from "@/constants/openapi/error-responses";
import type { OpenAPIResponses } from "@/types/openapi/openapi-responses";

type OpenAPIResponseMiddlewareParams = {
  tags: string[];
  responses: OpenAPIResponses;
  withoutDefaultResponses?: boolean;
  hideInProduction?: boolean;
};

export const openAPIResponseMiddleware = ({
  tags,
  responses,
  withoutDefaultResponses = false,
  hideInProduction = false,
}: OpenAPIResponseMiddlewareParams) => {
  const defaultResponses = withoutDefaultResponses ? {} : errorResponses;

  return describeRoute({
    hide: hideInProduction && envs.NODE_ENV === "production",
    tags,
    responses: {
      ...defaultResponses,
      ...responses,
    },
  });
};
