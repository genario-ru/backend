import { and, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { deleteProfileParamsSchema } from "@/schemas/domains/profiles/handlers/delete-profile/params";
import {
  type DeleteProfileResponse,
  deleteProfileResponseSchema,
} from "@/schemas/domains/profiles/handlers/delete-profile/response";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

export const deleteProfileRoute = createHonoApp().basePath(
  "/profiles/:profileId",
);

// DELETE /api/v1/profiles/{profileId}
deleteProfileRoute.delete(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "delete-profile",
    windowMs: 60 * 1000,
    limit: 20,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Profiles],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Profile deleted successfully",
        schema: deleteProfileResponseSchema,
      }),
    },
  }),
  validator("param", deleteProfileParamsSchema),
  async (c) => {
    const { profileId } = c.req.valid("param");
    const user = c.get("user");

    const [deletedProfile] = await db
      .delete(profile)
      .where(and(eq(profile.id, profileId), eq(profile.userId, user.id)))
      .returning();

    return c.json<DeleteProfileResponse>(
      deleteProfileResponseSchema.parse({
        data: deletedProfile,
      }),
    );
  },
);
