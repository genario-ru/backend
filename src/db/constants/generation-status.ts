import { pgEnum } from "drizzle-orm/pg-core";

import { generationStatuses } from "@/constants/common/generation-statuses";

export const generationStatus = pgEnum("generation_status", generationStatuses);
