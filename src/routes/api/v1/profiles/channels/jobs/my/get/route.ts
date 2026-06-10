import { db } from "@/db";
import {
  type GetMyProfilesFromChannelsJobResponse,
  getMyProfilesFromChannelsJobResponseSchema,
} from "@/domains/profiles/schemas/handlers/get-my-profiles-from-channels-job/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getMyProfilesFromChannelsJobs = createHonoApp().basePath(
  "/profiles/channels/jobs/my",
);

// GET /api/v1/profiles/channels/jobs/my
getMyProfilesFromChannelsJobs.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-my-profiles-from-channels-jobs",
    windowMs: 1000,
    limit: 2,
  }),
  sessionMiddleware,
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
        orderBy: (profilesFromChannelsJob, { desc }) =>
          desc(profilesFromChannelsJob.createdAt),
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
