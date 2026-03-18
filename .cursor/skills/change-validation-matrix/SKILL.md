---
name: change-validation-matrix
description: Selects and runs minimally sufficient backend verification based on coverage matrix. Use after any code changes before task finalization.
---

# Change Validation Matrix

## Goal

Do not finalize tasks without actual checks for changed areas.

## Steps

1. Identify changed areas:
   - API/routes/schemas;
   - DB/migrations;
   - MQ/workers;
   - env/config/docker;
   - codegen.
2. Select commands from `docs/workflows/verification-matrix.md`.
3. Run a minimally sufficient set of checks.
4. If something is not executed (time, environment, access), report it explicitly.

## Baseline Minimum

- `pnpm lint:typescript`

## Self-check

- Explicitly list what was validated, what was not, and why.
- Do not claim completion if no checks were run.
