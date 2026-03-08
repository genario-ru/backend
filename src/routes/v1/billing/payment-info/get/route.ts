import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import {
  type GetMyProfilesResponse,
  getMyProfilesResponseSchema,
} from "@/schemas/entities/profiles/handlers/get-my-profiles/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const getPaymentInfoRoute = createHonoApp().basePath(
  "/billing/payment-info",
);

// GET /api/v1/billing/payment-info
getPaymentInfoRoute.get(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Billing],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Payment info retrieved successfully",
        schema: getMyProfilesResponseSchema,
      }),
    },
  }),
  async (c) => {
    const user = c.get("user");

    const foundProfiles = await db.query.profile.findMany({
      where: (profile, { eq }) => eq(profile.userId, user.id),
      with: {
        user: true,
        type: true,
        profileToPlatform: {
          with: { platform: true },
        },
        profileToTone: {
          with: { tone: true },
        },
      },
    });

    return c.json<GetMyProfilesResponse>(
      getMyProfilesResponseSchema.parse({
        data: foundProfiles.map((profile) => ({
          ...profile,
          platforms: profile.profileToPlatform.map(({ platform }) => platform),
          tones: profile.profileToTone.map(({ tone }) => tone),
        })),
      }),
    );
  },
);
