# CLAUDE.md — Backend Project Guide

This file is loaded automatically by Claude Code at session start.

## Project overview

TypeScript + **Hono** HTTP API with **Drizzle ORM**, **BullMQ** background workers, and **Better Auth**.
Two entrypoints: HTTP server (`server.ts`) and background worker process (`workers.ts`).
External API clients (Tochka, YooKassa) generated via Kubb from OpenAPI specs.

---

## Architecture: source structure

```
src/
├── entrypoints/        # server.ts (HTTP + Bull Board), workers.ts (BullMQ)
├── routes/             # Hono route handlers by domain
│   ├── api/auth/       # Better Auth routes
│   └── api/v1/         # REST API — one folder per domain
├── domains/            # Domain-specific schemas and services
│   └── <domain>/
│       └── schemas/
│           ├── entities/   # Drizzle-derived Zod entity schemas
│           └── handlers/   # Per-handler param/body/query/response schemas
├── db/                 # Drizzle ORM
│   ├── schema.ts       # Re-exports all table definitions
│   └── schemas/        # Table schemas by group (auth, billing, primary, …)
├── mq/                 # BullMQ queues + workers (one folder per job type)
├── ai/                 # AI prompts and provider configuration
├── lib/                # Infrastructure: redis, s3, zod, api-client, …
├── middleware/          # Hono middleware (session, rate-limit, openapi-response, …)
├── shared/             # Cross-domain constants, schemas, utils
│   ├── constants/      # HTTP status codes, OpenAPI tags, env constants
│   ├── schemas/        # API error schemas
│   └── utils/          # throwAPIError, createHonoApp, createOpenAPIResponse, …
├── codegen/            # GENERATED — never edit manually (Kubb output)
└── globals/            # .d.ts type declarations
```

**Domain areas that require the reference-first rule**:
`src/routes/**`, `src/domains/**`, `src/db/**`, `src/mq/**`, `src/lib/**`, `src/ai/**`

---

## Tech stack

| Tool         | Usage                                                                      |
| ------------ | -------------------------------------------------------------------------- |
| Hono 4       | HTTP framework; `createHonoApp()` from `@/shared/utils/server`             |
| Drizzle ORM  | DB queries + schema; migrations via `drizzle-kit`                          |
| BullMQ       | Background job queues; shared Redis from `@/lib/redis`                     |
| Better Auth  | Session management; `sessionMiddleware` reads `c.get("user")`              |
| Zod 4        | Validation; always import from `@/lib/zod` (not `"zod"`)                   |
| hono-openapi | OpenAPI metadata via `openAPIResponseMiddleware` + `createOpenAPIResponse` |
| Kubb 4       | OpenAPI → TS types for external APIs (Tochka, YooKassa)                    |
| drizzle-zod  | `createSelectSchema(table)` for entity Zod schemas                         |

---

## Key patterns

### Route handler

```typescript
// src/routes/api/v1/<domain>/<resource>/<method>/route.ts
import { validator } from "hono-openapi";
import { db } from "@/db";
import { getThingParamsSchema } from "@/domains/<domain>/schemas/handlers/get-thing/params";
import {
  type GetThingResponse,
  getThingResponseSchema,
} from "@/domains/<domain>/schemas/handlers/get-thing/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const getThingRoute = createHonoApp().basePath("/things/:thingId");

getThingRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({ keyPrefix: "get-thing", windowMs: 60_000, limit: 10 }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Things],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Thing retrieved successfully",
        schema: getThingResponseSchema,
      }),
    },
  }),
  validator("param", getThingParamsSchema),
  async (c) => {
    const { thingId } = c.req.valid("param");
    const user = c.get("user");

    const found = await db.query.thing.findFirst({
      where: (t, { eq }) => eq(t.id, thingId),
    });
    if (!found)
      return throwAPIError({ code: APIErrorCode.NotFound, message: "..." });
    if (found.userId !== user.id)
      return throwAPIError({ code: APIErrorCode.Forbidden, message: "..." });

    return c.json<GetThingResponse>(
      getThingResponseSchema.parse({ data: found }),
    );
  },
);
```

Middleware order: `sessionMiddleware → rateLimitMiddleware → subscriptionMiddleware → openAPIResponseMiddleware → validator`

### Entity schema (drizzle-zod)

```typescript
// src/domains/<domain>/schemas/entities/<thing>.ts
import { createSelectSchema } from "drizzle-zod";
import { thing } from "@/db/schema";
import { z } from "@/lib/zod";

export const thingSchema = createSelectSchema(thing).meta({
  title: "Thing",
  description: "Thing description",
  ref: "ThingSchema",
});
export type Thing = z.infer<typeof thingSchema>;
```

### Handler schemas

```typescript
// params.ts
import { z } from "@/lib/zod";
export const getThingParamsSchema = z.object({ thingId: z.uuid() });
export type GetThingParams = z.infer<typeof getThingParamsSchema>;

// response.ts
import { z } from "@/lib/zod";
import { thingSchema } from "../../entities/thing";
export const getThingResponseSchema = z.object({ data: thingSchema }).meta({
  title: "Get thing response",
  description: "Get thing response description",
  ref: "GetThingResponseSchema",
});
export type GetThingResponse = z.infer<typeof getThingResponseSchema>;
```

### BullMQ queue + worker

```typescript
// src/mq/<domain>-<action>/queue.ts
import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

export const MY_JOB_QUEUE_NAME = "my-domain-action";
export type MyJobData = { entityId: string };

export const myJobQueue = new Queue<MyJobData>(MY_JOB_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});
export function enqueueMyJob(data: MyJobData) {
  return myJobQueue.add("my-job", data);
}

// src/mq/<domain>-<action>/worker.ts
import { Worker } from "bullmq";
import { redis } from "@/lib/redis";
import { MY_JOB_QUEUE_NAME, type MyJobData } from "./queue";

export const myJobWorker = new Worker<MyJobData>(
  MY_JOB_QUEUE_NAME,
  async (job) => {
    const { entityId } = job.data;
    // ... processing logic
  },
  { connection: redis },
);
```

After creating queue/worker: register worker in `workers.ts`, add queue to Bull Board in `server.ts`.

### New env variable — 4 required update points

1. `src/schemas/common/envs.ts` — Zod schema
2. `src/constants/common/envs.ts` — `process.env` mapping
3. `docker-compose.yml` — both `server` and `workers` services
4. `.env.example` — documentation

### Route registration in server.ts

After creating a new route, import and register it in `src/entrypoints/server.ts` with `app.route("/api/v1/...", myRoute)`.

---

## Existing domains

`archive`, `attachments`, `billing`, `credits`, `ideas`, `ideas-lists`, `platforms`,
`profiles`, `referral`, `scenarios`, `subscriptions`, `tariffs`, `templates`,
`tones`, `users`, `video-durations`, `video-types`

---

## Commands

```bash
pnpm dev                          # HTTP server in watch mode
pnpm dev:workers                  # BullMQ workers in watch mode
pnpm build                        # tsup production build
pnpm lint:typescript              # Type check only
pnpm lint:fix                     # ESLint + Prettier auto-fix

pnpm db:generate                  # Generate Drizzle migration from schema changes
pnpm db:migrate                   # Apply pending migrations
pnpm db:push                      # Push schema directly (local experiments only)
pnpm db:studio                    # Open Drizzle Studio

pnpm api:download:tochka          # Refresh Tochka OpenAPI spec
pnpm api:download:yookassa        # Refresh YooKassa OpenAPI spec
pnpm api:generate                 # Regenerate src/codegen/api/** (Kubb)
```

---

## Completion checklist (every task)

1. Changes are in the correct source area (routes, domains, db, mq, lib).
2. No manual edits to `src/codegen/**`.
3. New route? → registered in `src/entrypoints/server.ts`.
4. New worker? → registered in `src/entrypoints/workers.ts` + Bull Board in `server.ts`.
5. DB schema changed? → `pnpm db:generate && pnpm db:migrate`; commit schema + migration together.
6. New env variable? → all 4 propagation points updated.
7. `pnpm lint:fix` → `pnpm lint:typescript`

---

## Pre-coding rule (new domain files)

Before creating any new file in `routes/`, `domains/`, `db/`, `mq/`, `lib/`, or `ai/`:
find and read at least **3 similar implementations** in the same area to match local conventions.
List the references used before writing code.
