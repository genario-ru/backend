import { z } from "@/lib/zod";

import { creditsPackageSchema } from "../../entities/credits-package";

export const getCreditsPackagesResponseSchema = z
  .object({
    data: z.array(creditsPackageSchema),
  })
  .meta({
    title: "Get credits packages response",
    description: "Get credits packages response description",
    ref: "GetCreditsPackagesResponseSchema",
  });

export type GetCreditsPackagesResponse = z.infer<
  typeof getCreditsPackagesResponseSchema
>;
