---
name: add-api-endpoint
description: Adds a new backend endpoint using the project Hono + Zod + OpenAPI pattern with proper route registration in server entrypoint. Use when creating new API handlers.
---

# Add API Endpoint

## Goal

Add an endpoint without missing schema validation, OpenAPI, or router registration steps.

## Steps

1. Define endpoint location in `src/routes/v1/...`.
2. Create/update schemas in `src/schemas/entities/.../handlers/<handler>/`:
   - `params.ts` for path params;
   - `query.ts` for query parameters;
   - `body.ts` for request body;
   - `response.ts` for response payload.
3. Implement route:
   - `createHonoApp().basePath(...)`;
   - middleware in project order;
   - `validator(...)` for input;
   - `throwAPIError(...)` for domain errors;
   - `c.json<ResponseType>(responseSchema.parse({ data }))`.
4. Register route in `src/entrypoints/server.ts`.
5. Ensure endpoint is visible in OpenAPI.

## Self-check

- Endpoint is registered in `server.ts`.
- All inputs/outputs are schema-typed.
- Response is not returned without `responseSchema.parse`.
- No unjustified `any`.
