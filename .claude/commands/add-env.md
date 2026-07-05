# Add Environment Variable

Add, rename, or remove an environment variable across all backend layers.

## Arguments

`$ARGUMENTS` - variable name and purpose, for example `R2_ACCESS_KEY_ID for S3-compatible storage`.

## Required Update Points

1. `env.ts` - validation schema and `process.env` mapping. Direct `zod` import is allowed here because `@t3-oss/env-core` expects it.
2. `.env.example` - documented example value.
3. `docker-compose.yml` - both `server` and `workers` services for runtime variables.
4. `Dockerfile` only for build-time variables, such as release metadata.

## Workflow

1. Decide whether the variable is required, optional, runtime, or build-time.
2. Add or update validation in `env.ts`.
3. Propagate runtime variables to both `server` and `workers` in `docker-compose.yml`.
4. Update `.env.example`.
5. Search for old/new variable names to catch casing drift.
6. Run `pnpm validate:env` when a representative `.env` is available; otherwise report why it was skipped.
7. Run `pnpm lint:typescript` if TypeScript code changed.

## Finish Checklist

- Variable is validated at startup.
- Names match across all files.
- `server` and `workers` have consistent runtime env blocks.
- Optional/default semantics are explicit.

## Reference Examples

- Validation and defaults: `env.ts`.
- Example variable list: `.env.example`.
- Runtime propagation: `docker-compose.yml`.
- Build-time release metadata: `Dockerfile`.
