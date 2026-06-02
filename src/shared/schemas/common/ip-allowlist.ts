import { z } from "@/lib/zod";
import { isValidIpAllowlist } from "@/shared/utils/server/ip-allowlist";

export const ipAllowlistSchema = z
  .string()
  .refine(isValidIpAllowlist, "Ожидается список IP/CIDR, разделенный запятыми");
