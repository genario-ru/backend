import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import {
  type GetMyProfilesFromChannelsJobResponse,
  getMyProfilesFromChannelsJobResponseSchema,
} from "@/schemas/entities/profiles/handlers/get-my-profiles-from-channels-job/response";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

export const getMyProfilesFromChannelsJobs = createHonoApp().basePath(
  "/profiles/channels/jobs/my",
);

// GET /api/v1/profiles/channels/jobs/my
getMyProfilesFromChannelsJobs.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-my-profiles-from-channels-jobs",
    windowMs: 60 * 1000,
    limit: 20,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Profiles],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "My profiles from channels jobs retrieved successfully",
        schema: getMyProfilesFromChannelsJobResponseSchema,
      }),
    },
  }),
  async (c) => {
    const user = c.get("user");

    const foundProfilesFromChannelsJobs =
      await db.query.profilesFromChannelsJob.findMany({
        where: (profilesFromChannelsJob, { eq }) =>
          eq(profilesFromChannelsJob.userId, user.id),
      });

    return c.json<GetMyProfilesFromChannelsJobResponse>(
      getMyProfilesFromChannelsJobResponseSchema.parse({
        data: foundProfilesFromChannelsJobs,
      }),
    );
  },
);
