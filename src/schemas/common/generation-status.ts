import { generationStatuses } from "@/constants/common/generation-statuses";
import { z } from "@/lib/zod";

export const generationStatusSchema = z.enum(generationStatuses);

export type GenerationStatus = z.infer<typeof generationStatusSchema>;
