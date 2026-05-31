@AGENTS.md

# Claude Code Notes

Use `AGENTS.md` as the shared project contract, but inspect the relevant local
files before editing. This repository has many generated, registered, and
cross-process artifacts; missing a registration step is a common failure mode.

## Default Task Flow

1. Identify the changed area: route, domain schema/service, DB, MQ, env, codegen,
   AI prompt, lib integration, or tests.
2. Read the matching local references before writing:
   - 3 nearby routes for endpoint work;
   - 3 similar `src/domains/**` schema/service files for domain work;
   - 3 DB schemas/relations for database work;
   - 3 queue/worker pairs for BullMQ work;
   - existing prompt builder/type/template triplets for AI prompt work.
3. Make the smallest change that satisfies the request.
4. Update registration points:
   - routes in `src/entrypoints/server.ts`;
   - queues in Bull Board inside `server.ts`;
   - workers and shutdown in `src/entrypoints/workers.ts`;
   - env variables in `env.ts`, `.env.example`, and docker compose.
5. Run the narrowest valid checks and report skipped checks honestly.

## Claude-Specific Guidance

- Prefer `.claude/commands/**` for repeatable workflows.
- Use `.claude/agents/**` for focused review, planning, codegen adaptation, DB
  planning, API review, or TypeScript repair.
- Do not add personal permissions or local preferences to committed project
  instructions.
- If a memory file disagrees with `AGENTS.md`, update the memory file rather
  than following stale memory.
