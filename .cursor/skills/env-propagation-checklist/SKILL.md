---
name: env-propagation-checklist
description: Handles adding a new env variable across all required backend layers (schema, constants, Docker). Use when environment configuration changes.
---

# Env Propagation Checklist

## When To Use

When adding, renaming, or removing an environment variable.

## Required Update Points

1. `src/schemas/common/envs.ts` - variable type and validation.
2. `src/constants/common/envs.ts` - mapping from `process.env`.
3. `docker-compose.yml` - variable for both `server` and `workers`.
4. `Dockerfile` - `ARG`/`ENV` if variable is needed at build/runtime image level.
5. `.env.example` - example and documentation for the variable.

## Steps

1. Add variable to schema and constants.
2. Propagate variable through Docker configuration.
3. Update `.env.example`.
4. Run a minimal startup validation (`pnpm dev` or relevant workflow).

## Self-check

- Variable is validated at startup.
- Variable name is consistent across files.
- No case where `server` has the variable but `workers` does not.
