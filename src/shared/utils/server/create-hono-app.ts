import { Hono } from "hono";

import type { AppEnv } from "@/shared/types/server/app-env";

export function createHonoApp() {
  return new Hono<AppEnv>({ strict: false });
}
