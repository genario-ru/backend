---
name: openapi-codegen-kubb
description: Updates OpenAPI specifications and regenerates API clients via Kubb for YooKassa, SocialKit, or codegen configuration changes.
---

# OpenAPI Codegen Kubb

## When To Use

- External OpenAPI specification changed.
- `kubb.config.ts` changed.
- `src/codegen/api/**` must be regenerated.

## Steps

1. Check `package.json` scripts and `deps/api/*.json` to confirm which provider workflow exists.
2. Refresh specifications when a download script exists:
   - `pnpm api:download:yookassa`
   - `pnpm api:download:socialkit`
3. Run generation: `pnpm api:generate`.
4. Review `git diff` in `deps/api/**`, `src/codegen/api/**`, and consuming wrappers/services.
5. If needed, adjust `kubb.config.ts` (`importPath`, parser, transformers, naming, output paths).
6. Re-run generation after config changes.
7. Run `pnpm lint:typescript` after generated code or wrappers change.

## Rules

- Do not manually edit generated files unless absolutely necessary.
- Keep API-specific normalizations in download scripts.
- Verify generated code still uses project aliases and expected output structure.
- Keep generated code and hand-written adapter changes easy to distinguish in the final summary.

## Self-check

- Generation completes without errors.
- Diff includes only expected changes.
- No regressions in client/schema import paths.
- No manual edits were made inside generated provider folders unless explicitly documented.

## Reference Examples

- Provider setup and output shape: `kubb.config.ts`.
- YooKassa download/normalization script: `src/scripts/download-yookassa-openapi.ts`.
- SocialKit download/normalization script: `src/scripts/download-socialkit-openapi.ts`.
- Generated provider folders: `src/codegen/api/yookassa/**`, `src/codegen/api/socialkit/**`.
- Hand-written clients: `src/lib/yookassa/client/index.ts`, `src/lib/socialkit/client/index.ts`.
- Consumer search: `rg "from \"@/codegen/api" src -g "*.ts"`.
