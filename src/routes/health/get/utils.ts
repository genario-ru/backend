import { sql } from "drizzle-orm";

import { db } from "@/db";
import { redis } from "@/lib/redis";
import type { HealthCheck } from "@/schemas/entities/health/handlers/entities/health-check";

export async function probePostgres(): Promise<HealthCheck> {
  const started = Date.now();
  try {
    await db.execute(sql`select 1`);

    return { status: "ok", latencyMs: Date.now() - started };
  } catch {
    return { status: "error", latencyMs: Date.now() - started };
  }
}

export async function probeRedis(): Promise<HealthCheck> {
  const started = Date.now();
  try {
    const pong = await redis.ping();

    if (pong !== "PONG") {
      return { status: "error", latencyMs: Date.now() - started };
    }

    return { status: "ok", latencyMs: Date.now() - started };
  } catch {
    return { status: "error", latencyMs: Date.now() - started };
  }
}
