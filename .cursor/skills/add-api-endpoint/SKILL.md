---
name: add-api-endpoint
description: Adds a backend endpoint using the project Hono + Zod + OpenAPI pattern with proper schema placement and route registration.
---

# Add API Endpoint

## Goal

Add an endpoint without missing schema validation, OpenAPI metadata, or router registration.

## Steps

1. Inspect at least 3 nearby route modules under `src/routes/api/v1/**` and their matching domain schemas.
2. Define endpoint location in `src/routes/api/v1/<domain>/.../<method>/route.ts`.
3. Create/update schemas in `src/domains/<domain>/schemas/handlers/<handler-name>/`:
   - `params.ts` for path params;
   - `query.ts` for query parameters;
   - `body.ts` for request body;
   - `response.ts` for response payload.
4. Implement route:
   - `createHonoApp().basePath(...)`;
   - protected middleware order: `sessionMiddleware -> rateLimitMiddleware -> subscriptionMiddleware -> openAPIResponseMiddleware -> validator`;
   - public route exceptions only when local precedent supports them;
   - `validator("param" | "query" | "json", ...)` for input;
   - read inputs from `c.req.valid(...)`;
   - `throwAPIError(...)` for domain errors;
   - no local `try/catch` unless custom error mapping, cleanup, or required side effects are needed;
   - `c.json<ResponseType>(responseSchema.parse({ data }))`.
5. Export the route from the nearest route `index.ts`.
6. Register route in `src/entrypoints/server.ts`, usually in `appAPIv1RoutesList`.
7. Ensure endpoint is visible in OpenAPI and response metadata is meaningful.
8. Run at least `pnpm lint:typescript`; run targeted tests when behavior has coverage.

## Self-check

- Endpoint is registered in `server.ts`.
- All inputs/outputs are schema-typed.
- Response is not returned without `responseSchema.parse`.
- No unjustified `any`.
- References inspected are listed in the final response.

## Reference Examples

- Public read route: `src/routes/api/v1/product-features/root/get/route.ts`.
- Public write + transaction: `src/routes/api/v1/applications/root/post/route.ts`.
- Protected route + async enqueue: `src/routes/api/v1/scenarios/root/post/route.ts`.
- Route with justified custom `try/catch`: `src/routes/api/v1/attachments/attachment/download/get/route.ts`.
- Matching schemas: `src/domains/applications/schemas/handlers/create-application/{body,response}.ts` and `src/domains/scenarios/schemas/handlers/create-scenario/{body,response}.ts`.
- Registration: nearby `index.ts` files plus `src/entrypoints/server.ts`.
