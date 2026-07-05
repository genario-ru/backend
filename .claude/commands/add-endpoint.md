# Add API Endpoint

Add or change a Hono REST endpoint using the real Genario backend layout.

## Arguments

`$ARGUMENTS` - endpoint description, for example `GET /api/v1/scenarios/:scenarioId`.

## Mandatory Research

Before coding, read at least 3 similar route handlers in `src/routes/api/v1/**` and their matching schemas in `src/domains/**/schemas/handlers/**`. List those paths before editing.

## Workflow

1. Create or update schemas in `src/domains/<domain>/schemas/handlers/<handler-name>/`:
   - `params.ts` for path params;
   - `query.ts` for query params;
   - `body.ts` for JSON bodies;
   - `response.ts` for response payloads and OpenAPI `.meta(...)`.
2. Implement route in `src/routes/api/v1/<domain>/.../<method>/route.ts`.
3. Use project imports:
   - `z` from `@/lib/zod`;
   - `createHonoApp`;
   - `openAPIResponseMiddleware`;
   - `createOpenAPIResponse`;
   - `throwAPIError`.
4. Use protected middleware order when applicable:
   `sessionMiddleware -> rateLimitMiddleware -> subscriptionMiddleware -> openAPIResponseMiddleware -> validator`.
5. Read inputs only through `c.req.valid(...)`.
6. Return responses as `c.json<ResponseType>(responseSchema.parse({ data }))`.
7. Do not add local `try/catch` unless custom error mapping, cleanup, or required side effects are needed.
8. Export from route indexes and register in `src/entrypoints/server.ts`, usually in `appAPIv1RoutesList`.
9. Run `pnpm lint:typescript`; add targeted tests when the behavior has coverage.

## Finish Checklist

- Schemas are under `src/domains/<domain>/schemas/handlers/<handler-name>/`.
- Response schema has meaningful OpenAPI metadata.
- Route uses validators and response parsing.
- Route is exported and registered in `server.ts`.
- No new `any` or direct `"zod"` imports.

## Reference Examples

- Public read route: `src/routes/api/v1/product-features/root/get/route.ts`.
- Public write + transaction: `src/routes/api/v1/applications/root/post/route.ts`.
- Protected route + async enqueue: `src/routes/api/v1/scenarios/root/post/route.ts`.
- Custom external-error mapping: `src/routes/api/v1/attachments/attachment/download/get/route.ts`.
- Matching schemas: `src/domains/scenarios/schemas/handlers/create-scenario/{body,response}.ts`.
- Registration: `src/routes/api/v1/scenarios/index.ts`, `src/entrypoints/server.ts`.
