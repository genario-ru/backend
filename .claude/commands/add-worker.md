# Add BullMQ Worker

Add a background job queue and worker following the project pattern.

## Arguments

`$ARGUMENTS` - job description, for example `generate scenario metadata`.

## Mandatory Research

Before coding, read at least 3 queue/worker pairs in `src/mq/**`. List the reference paths before editing.

## Workflow

1. Create `src/mq/<domain-or-feature>/queue.ts` with:
   - queue name constant;
   - typed `Queue<JobData>`;
   - shared Redis from `@/lib/redis`;
   - enqueue helper.
2. Create `src/mq/<domain-or-feature>/worker.ts` with:
   - typed `Worker<JobData>`;
   - existing logging/Sentry/error handling style;
   - no `any` payloads.
3. Register the worker in `src/entrypoints/workers.ts` and close it in `shutdown()`.
4. Register the queue in Bull Board inside `src/entrypoints/server.ts`.
5. Update routes/services to call the enqueue helper, not construct jobs ad hoc.
6. Run `pnpm lint:typescript`; run targeted worker tests when available.

## Finish Checklist

- Queue and worker share the same queue name.
- Job payload is fully typed.
- Worker starts and closes in `workers.ts`.
- Queue appears in Bull Board.
- Enqueue call sites use the helper.
