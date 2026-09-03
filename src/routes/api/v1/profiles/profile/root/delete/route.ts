import { and, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { profile } from "@/db/schema";
import { deleteProfileParamsSchema } from "@/domains/profiles/schemas/handlers/delete-profile/params";
import {
  type DeleteProfileResponse,
  deleteProfileResponseSchema,
} from "@/domains/profiles/schemas/handlers/delete-profile/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const deleteProfileRoute = createHonoApp().basePath(
  "/profiles/:profileId",
);

// DELETE /api/v1/profiles/{profileId}
deleteProfileRoute.delete(
  "/",
  rateLimitMiddleware({
    keyPrefix: "delete-profile",
    windowMs: 2 * 1000,
    limit: 1,
  }),
  sessionMiddleware,
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
