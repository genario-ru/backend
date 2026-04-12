# Add API Endpoint

Add a new Hono REST endpoint following the project pattern.

## Arguments

`$ARGUMENTS` — description of the endpoint (e.g. "GET /api/v1/scenarios/:scenarioId" or "POST /api/v1/ideas-lists/:listId/ideas").

## Pre-coding step (mandatory)

Before writing any code, read at least **3 similar route handlers** in `src/routes/api/v1/`:

```bash
# Find existing handlers to use as reference
ls src/routes/api/v1/
```

List the reference paths before writing code.

## Step 1 — Create schemas

Create files in `src/domains/<domain>/schemas/handlers/<handler-name>/`:

| File | When | Content |
|------|------|---------|
| `params.ts` | Path has `:id` params | `z.object({ thingId: z.uuid() })` |
| `query.ts` | Query string params | `z.object({ page: z.coerce.number().optional() })` |
| `body.ts` | POST/PATCH with JSON body | `z.object({ name: z.string().min(1) })` |
| `response.ts` | Always | `z.object({ data: entitySchema }).meta({ title, description, ref })` |

All schemas: import `z` from `@/lib/zod`.
Response schema: always includes `.meta({ title: "...", description: "...", ref: "..." })`.

## Step 2 — Implement route

Create `src/routes/api/v1/<domain>/<resource>/<method>/route.ts`:

```typescript
import { validator } from "hono-openapi";
import { db } from "@/db";
import { getThingParamsSchema } from "@/domains/<domain>/schemas/handlers/get-thing/params";
import { type GetThingResponse, getThingResponseSchema } from "@/domains/<domain>/schemas/handlers/get-thing/response";
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

    const found = await db.query.thing.findFirst({ where: (t, { eq }) => eq(t.id, thingId) });
    if (!found) return throwAPIError({ code: APIErrorCode.NotFound, message: "..." });
    if (found.userId !== user.id) return throwAPIError({ code: APIErrorCode.Forbidden, message: "..." });

    return c.json<GetThingResponse>(getThingResponseSchema.parse({ data: found }));
  },
);
```

**Middleware order** (strict): `sessionMiddleware → rateLimitMiddleware → subscriptionMiddleware → openAPIResponseMiddleware → validator`

## Step 3 — Export and register

1. Export from `src/routes/api/v1/<domain>/index.ts`
2. Import and register in `src/entrypoints/server.ts`:
   ```typescript
   app.route("/api/v1", getThingRoute);
   ```

## Finish checklist

- [ ] Schemas in `src/domains/<domain>/schemas/handlers/<handler>/`
- [ ] Response schema has `.meta({ title, description, ref })`
- [ ] Middleware in correct order
- [ ] Inputs read only via `c.req.valid(...)`
- [ ] Response wrapped in `responseSchema.parse({ data })`
- [ ] No `any`
- [ ] Route registered in `server.ts`
- Run: `pnpm lint:fix && pnpm lint:typescript`
