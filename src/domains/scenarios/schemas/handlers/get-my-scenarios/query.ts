import { z } from "@/lib/zod";
import { queryMetaSchema } from "@/shared/schemas/common/meta";

export const getMyScenariosQuerySchema = queryMetaSchema
  .omit({ sortBy: true, sortOrder: true })
  .extend({
    sort: z.string().optional(),
    templateIds: z.union([z.array(z.string()), z.string()]).optional(),
    profileIds: z.union([z.array(z.string()), z.string()]).optional(),
    toneIds: z.union([z.array(z.string()), z.string()]).optional(),
    videoTypeIds: z.union([z.array(z.string()), z.string()]).optional(),
    platformIds: z.union([z.array(z.string()), z.string()]).optional(),
    videoDurationIds: z.union([z.array(z.string()), z.string()]).optional(),
    productionStatusIds: z.union([z.array(z.string()), z.string()]).optional(),
    scheduledStartAtFrom: z.iso.datetime({ offset: true }).optional(),
    scheduledStartAtTo: z.iso.datetime({ offset: true }).optional(),
    isScheduled: z
      .union([z.boolean(), z.enum(["true", "false"])])
      .transform((value) =>
        typeof value === "boolean" ? value : value === "true",
      )
      .optional(),
  });

export type GetMyScenariosQuery = z.infer<typeof getMyScenariosQuerySchema>;
