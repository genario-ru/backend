import * as z from "zod";

import { profileSchema } from "../../entities/profile";
import { profilesRegistry } from "../../registry";

export const deleteProfileResponseSchema = z
  .object({
    data: profileSchema,
  })
  .register(profilesRegistry, {
    title: "Delete profile response",
    description: "Delete profile response description",
    ref: "DeleteProfileResponseSchema",
  });

export type DeleteProfileResponse = z.infer<typeof deleteProfileResponseSchema>;
