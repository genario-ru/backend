import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import {
  type GetMyReferralCodesResponse,
  getMyReferralCodesResponseSchema,
} from "@/domains/referral/schemas/handlers/get-my-referral-codes/response";
import { getReferralInfoResponseSchema } from "@/domains/referral/schemas/handlers/get-referral-info/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

import { REFERRAL_BASIC_INFO, REFERRAL_DOCUMENT_LINK } from "./constants";

export const getReferralInfoRoute = createHonoApp().basePath("/referral/info");

// GET /api/v1/referral/info
getReferralInfoRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-referral-info",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Referral],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Referral info retrieved successfully",
        schema: getReferralInfoResponseSchema,
      }),
    },
  }),
  (c) => {
    return c.json<GetMyReferralCodesResponse>(
      getMyReferralCodesResponseSchema.parse({
        data: {
          referralBasicInfo: REFERRAL_BASIC_INFO,
          referralDocumentLink: REFERRAL_DOCUMENT_LINK,
        },
      }),
    );
  },
);
