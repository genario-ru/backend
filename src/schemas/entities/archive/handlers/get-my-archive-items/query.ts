import * as z from "zod";

import { metaQuerySchema } from "@/schemas/common/meta";

import { archiveEntitySchema } from "../../entities/archive-item";
import { archiveRegistry } from "../../registry";

export const getMyArchiveItemsQuerySchema = metaQuerySchema
  .extend({
    entity: archiveEntitySchema.optional(),
    templateIds: z.array(z.string().uuid()).optional(),
    profileIds: z.array(z.string().uuid()).optional(),
    sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
  })
  .register(archiveRegistry, {
    title: "Get my archive items query",
    description: "Query parameters for getting archive items",
    ref: "GetMyArchiveItemsQuerySchema",
  });

export type GetMyArchiveItemsQuery = z.infer<
  typeof getMyArchiveItemsQuerySchema
>;
