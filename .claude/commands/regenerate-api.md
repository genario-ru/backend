# Regenerate External API Clients

Update OpenAPI specs and regenerate Kubb clients.

## Arguments

`$ARGUMENTS` - provider and reason, for example `YooKassa webhook payload changed`.

## Workflow

1. Check `package.json`, `deps/api/*.json`, and `kubb.config.ts`.
2. Refresh specs when scripts exist:
   ```bash
   pnpm api:download:yookassa
   pnpm api:download:socialkit
   ```
3. Regenerate all clients:
   ```bash
   pnpm api:generate
   ```
4. Review generated diff:
   ```bash
   git diff -- src/codegen/api deps/api kubb.config.ts
   ```
5. Adapt hand-written code that imports from `@/codegen/api/**`, especially in `src/lib/**` and `src/domains/**`.
6. Run `pnpm lint:typescript`.

## Rules

- Never edit `src/codegen/api/**` manually unless explicitly documenting an emergency exception.
- Fix bad generated output in `kubb.config.ts` or download scripts, then regenerate.
- Keep generated-code changes and wrapper/service changes clear in the final summary.

## Reference Examples

- Kubb provider configuration: `kubb.config.ts`.
- YooKassa download/normalization script: `src/scripts/download-yookassa-openapi.ts`.
- Generated provider folders: `src/codegen/api/yookassa/**`, `src/codegen/api/socialkit/**`.
- Hand-written clients: `src/lib/yookassa/client/index.ts`, `src/lib/socialkit/client/index.ts`.
- Consumer search: `rg "from \"@/codegen/api" src -g "*.ts"`.
