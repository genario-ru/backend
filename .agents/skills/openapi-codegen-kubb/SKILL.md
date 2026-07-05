---
name: openapi-codegen-kubb
description: Use when updating generated external API clients for YooKassa, Rutube, or Kubb configuration.
---

# OpenAPI Codegen Kubb

Generated code lives in `src/codegen/api/{yookassa,rutube}/**`; specs live in `deps/api/*.json`.

1. Check `package.json`, `kubb.config.ts`, and `deps/api/*.json` to confirm the provider workflow.
2. Refresh specs when scripts exist:
   - `pnpm api:download:yookassa`
3. Treat `deps/api/rutube.json` as a pinned local spec unless explicitly changing that workflow.
4. Run `pnpm api:generate`.
5. Review diffs in `deps/api/**`, `src/codegen/api/**`, and hand-written wrappers/services.
6. Adjust `kubb.config.ts` only when needed for import paths, parser behavior, transformers, naming, or output paths.
7. Run `pnpm lint:typescript` after generated code or wrappers change.

Do not manually edit generated provider folders unless explicitly documenting an emergency exception.

## Reference Examples

- Kubb provider configuration: `kubb.config.ts`.
- YooKassa spec download and normalization: `src/scripts/download-yookassa-openapi.ts`.
- Generated output roots: `src/codegen/api/yookassa/**`, `src/codegen/api/rutube/**`.
- Hand-written clients consumed by generated code: `src/lib/yookassa/client/index.ts`, `src/lib/rutube/client/index.ts`.
- Adapter usage outside generated folders: search `rg "from \"@/codegen/api" src -g "*.ts"`.
