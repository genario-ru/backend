# Regenerate External API Clients

Update OpenAPI specs and regenerate Kubb clients.

## Arguments

`$ARGUMENTS` - provider and reason, for example `YooKassa webhook payload changed`.

## Workflow

1. Check `package.json`, `deps/api/*.json`, and `kubb.config.ts`.
2. Refresh specs when scripts exist:
   ```bash
   pnpm api:download:tochka
   pnpm api:download:yookassa
   ```
3. Treat `deps/api/rutube.json` as a pinned local spec unless explicitly changing Rutube automation.
4. Regenerate all clients:
   ```bash
   pnpm api:generate
   ```
5. Review generated diff:
   ```bash
   git diff -- src/codegen/api deps/api kubb.config.ts
   ```
6. Adapt hand-written code that imports from `@/codegen/api/**`, especially in `src/lib/**` and `src/domains/**`.
7. Run `pnpm lint:typescript`.

## Rules

- Never edit `src/codegen/api/**` manually unless explicitly documenting an emergency exception.
- Fix bad generated output in `kubb.config.ts` or download scripts, then regenerate.
- Keep generated-code changes and wrapper/service changes clear in the final summary.
