import { z } from "@/lib/zod";

import { profilesFromChannelsJobSchema } from "../../entities/profiles-from-channels-job";

export const getMyProfilesFromChannelsJobResponseSchema = z
  .object({
    data: z.array(profilesFromChannelsJobSchema),
  })
  .meta({
    title: "Get my profiles from channels job response",
    description: "Get my profiles from channels job response description",
    ref: "GetMyProfilesFromChannelsJobResponseSchema",
  });

export type GetMyProfilesFromChannelsJobResponse = z.infer<
  typeof getMyProfilesFromChannelsJobResponseSchema
>;
