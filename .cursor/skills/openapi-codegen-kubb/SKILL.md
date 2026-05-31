---
name: openapi-codegen-kubb
description: Updates OpenAPI specifications and regenerates API clients via Kubb for Tochka, YooKassa, Rutube, or codegen configuration changes.
---

# OpenAPI Codegen Kubb

## When To Use

- External OpenAPI specification changed.
- `kubb.config.ts` changed.
- `src/codegen/api/**` must be regenerated.

## Steps

1. Check `package.json` scripts and `deps/api/*.json` to confirm which provider workflow exists.
2. Refresh specifications when a download script exists:
   - `pnpm api:download:tochka`
   - `pnpm api:download:yookassa`
3. Treat `deps/api/rutube.json` as a pinned local spec unless the task explicitly adds or changes Rutube download automation.
4. Run generation: `pnpm api:generate`.
5. Review `git diff` in `deps/api/**`, `src/codegen/api/**`, and consuming wrappers/services.
6. If needed, adjust `kubb.config.ts` (`importPath`, parser, transformers, naming, output paths).
7. Re-run generation after config changes.
8. Run `pnpm lint:typescript` after generated code or wrappers change.

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
