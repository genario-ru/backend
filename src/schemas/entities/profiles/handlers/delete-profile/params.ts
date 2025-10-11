import * as z from "zod";

export const deleteProfileParamsSchema = z.object({
  profileId: z.uuid(),
});

export type DeleteProfileParams = z.infer<typeof deleteProfileParamsSchema>;
