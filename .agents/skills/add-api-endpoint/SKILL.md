---
name: add-api-endpoint
description: Use when adding or changing Genario backend API endpoints. Covers route placement, domain schemas, OpenAPI responses, and server registration.
---

# Add API Endpoint

Use this for endpoint work under `src/routes/api/v1/**`.

1. Inspect at least 3 nearby route modules and their matching schemas under `src/domains/<domain>/schemas/**`.
2. Place the route at `src/routes/api/v1/<domain>/.../<method>/route.ts`.
3. Place handler schemas at `src/domains/<domain>/schemas/handlers/<handler-name>/` (`params.ts`, `query.ts`, `body.ts`, `response.ts` as needed).
4. Implement the route with `createHonoApp().basePath(...)`.
5. Use protected middleware order when applicable: `sessionMiddleware -> rateLimitMiddleware -> subscriptionMiddleware -> openAPIResponseMiddleware -> validator`.
6. Use `validator("param" | "query" | "json", schema)` and read validated data via `c.req.valid(...)`.
7. Use `createOpenAPIResponse(...)`, `throwAPIError(...)`, and `responseSchema.parse(...)` before `c.json(...)`.
8. Do not add local `try/catch` unless custom error mapping, cleanup, or required side effects are needed. Let the global Hono error handler process ordinary errors.
9. Export through route indexes and register in `src/entrypoints/server.ts`, usually `appAPIv1RoutesList`.
10. Run `pnpm lint:typescript` for TypeScript changes and add targeted tests when behavior has coverage.

Report the references inspected and any registration points changed.

## Reference Examples

- Public read route: `src/routes/api/v1/product-features/root/get/route.ts`.
- Public write + transaction: `src/routes/api/v1/applications/root/post/route.ts`.
- Protected route + async enqueue: `src/routes/api/v1/scenarios/root/post/route.ts`.
- Route with custom provider error mapping: `src/routes/api/v1/attachments/attachment/download/get/route.ts`.
- Handler schemas: `src/domains/scenarios/schemas/handlers/create-scenario/{body,response}.ts`.
- Registration: `src/routes/api/v1/scenarios/index.ts`, `src/entrypoints/server.ts`.
