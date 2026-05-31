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
