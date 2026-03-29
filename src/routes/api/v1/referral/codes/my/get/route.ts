import { envs } from "@/constants/common/envs";
import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import {
  type GetMyReferralCodesResponse,
  getMyReferralCodesResponseSchema,
} from "@/schemas/entities/referral/handlers/get-my-referral-codes/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

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
