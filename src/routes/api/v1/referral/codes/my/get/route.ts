import { envs } from "@/constants/shared/common/envs";
import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import {
  type GetMyReferralCodesResponse,
  getMyReferralCodesResponseSchema,
} from "@/domains/referral/schemas/handlers/get-my-referral-codes/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

export const getMyReferralCodesRoute =
  createHonoApp().basePath("/referral/codes/my");

// GET /api/v1/referral/codes/my
getMyReferralCodesRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-my-referral-codes",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Referral],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "My referral codes retrieved successfully",
        schema: getMyReferralCodesResponseSchema,
      }),
    },
  }),
  async (c) => {
    const user = c.get("user");

    const referralCodes = await db.query.referralCode.findMany({
      where: (referralCode, { eq }) => eq(referralCode.userId, user.id),
      with: {
        referralReward: true,
      },
    });

    const referralCodesWithUrl = referralCodes.map((referralCode) => ({
      ...referralCode,
      referralUrl: `${envs.FRONTEND_BASE_URL}/sign-in?referralCode=${referralCode.code}`,
    }));

    return c.json<GetMyReferralCodesResponse>(
      getMyReferralCodesResponseSchema.parse({
        data: {
          referralCodes: referralCodesWithUrl,
        },
      }),
    );
  },
);
