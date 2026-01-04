import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { getProfileParamsSchema } from "@/schemas/entities/profiles/handlers/get-profile/params";
import {
  type GetProfileResponse,
  getProfileResponseSchema,
} from "@/schemas/entities/profiles/handlers/get-profile/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const getProfileRoute = createHonoApp().basePath("/profiles/:profileId");

// GET /api/v1/profiles/{profileId}
getProfileRoute.get(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Profiles],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Profile retrieved successfully",
        schema: getProfileResponseSchema,
      }),
    },
  }),
  validator("param", getProfileParamsSchema),
  async (c) => {
    const { profileId } = c.req.valid("param");
    const user = c.get("user");

    const foundProfile = await db.query.profile.findFirst({
      where: (profile, { eq, and }) => {
        return and(eq(profile.id, profileId), eq(profile.userId, user.id));
      },
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

    if (!foundProfile) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный профиль не существует или у вас нет возможности просматривать его",
      });
    }

    const { profileToPlatform, profileToTone, ...profile } = foundProfile;

    return c.json<GetProfileResponse>(
      getProfileResponseSchema.parse({
        data: {
          ...profile,
          platforms: profileToPlatform.map(({ platform }) => platform),
          tones: profileToTone.map(({ tone }) => tone),
        },
      }),
    );
  },
);
