---
name: env-propagation-checklist
description: Handles adding, renaming, or removing backend environment variables across schema, examples, and Docker services.
---

# Env Propagation Checklist

## When To Use

Use this when adding, renaming, or removing an environment variable.

## Required Update Points

1. `env.ts` - validation schema and mapping from `process.env`.
2. `.env.example` - example and documentation for the variable.
3. `docker-compose.yml` - variable for both `server` and `workers`.
4. `Dockerfile` only when the variable is build-time, for example release metadata.

## Steps

1. Decide whether the variable is required, optional, runtime, or build-time.
2. Add validation in `env.ts`. Direct `zod` import is acceptable here because `@t3-oss/env-core` expects it.
3. Propagate runtime variables to both `server` and `workers` in `docker-compose.yml`.
4. Update `.env.example`.
5. Update docs or deployment notes if the variable changes production setup.
6. Run `pnpm validate:env` when a representative `.env` is available; otherwise report why it was skipped.

## Self-check

- Variable is validated at startup.
- Variable name is consistent across files.
- No case exists where `server` has the variable but `workers` does not.
- Optional variables have explicit defaults or optional schema semantics.
