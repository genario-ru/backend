import { z } from "@/lib/zod";
import { generationStatuses } from "@/shared/constants/common/generation-statuses";

export const generationStatusSchema = z.enum(generationStatuses);

export type GenerationStatus = z.infer<typeof generationStatusSchema>;
