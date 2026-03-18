---
name: openapi-codegen-kubb
description: Updates OpenAPI specifications and regenerates API clients via Kubb in backend. Use when Tochka/YooKassa specs or codegen configuration changes.
---

# OpenAPI Codegen Kubb

## When To Use

- External OpenAPI specification changed.
- `kubb.config.ts` changed.
- `src/codegen/api/**` must be regenerated.

## Steps

1. Refresh specifications:
   - `pnpm api:download:tochka`
   - `pnpm api:download:yookassa`
2. Run generation: `pnpm api:generate`.
3. Review `git diff` in `src/codegen/api/**`.
4. If needed, adjust `kubb.config.ts` (for example `importPath`, transformers).
5. Re-run generation after config changes.

## Rules

- Do not manually edit generated files unless absolutely necessary.
- Keep API-specific normalizations in download scripts.
- Verify generated code still uses project aliases and expected output structure.

## Self-check

- Generation completes without errors.
- Diff includes only expected changes.
- No regressions in client/schema import paths.
