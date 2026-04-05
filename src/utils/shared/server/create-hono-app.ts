import { Hono } from "hono";

export function createHonoApp() {
  return new Hono({ strict: false });
}
