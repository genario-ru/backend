import { env } from "@/env";

export function getEmailSiteDomain(): string {
  return new URL(env.FRONTEND_BASE_URL).hostname;
}
