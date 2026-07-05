---
name: add-bullmq-worker
description: Adds a BullMQ queue and worker with mandatory registration in worker shutdown and Bull Board.
---

# Add BullMQ Worker

## Goal

Create a background processing module without missing runtime integration steps.

## Steps

1. Inspect at least 3 existing queue/worker pairs in `src/mq/**`.
2. Create folder `src/mq/<domain>/<feature>/`.
3. Add `queue.ts`:
   - queue name constant;
   - `Queue<JobData>` with shared Redis configuration from `@/lib/redis`;
   - `enqueue...(...)` helper.
4. Add `worker.ts`:
   - `Worker<JobData>`;
   - job handler with input validation when payload crosses a trust boundary;
   - existing logging/Sentry/error handling pattern;
   - no broad `try/catch` wrapper unless cleanup or custom failure-state updates are required.
5. Update `src/entrypoints/workers.ts`:
   - import worker;
   - add `await worker.close()` in `shutdown()`.
6. Update `src/entrypoints/server.ts`:
   - import queue;
   - add `new BullMQAdapter(queue)` to `createBullBoard`.
7. If a route or service enqueues jobs, make sure it imports the enqueue helper rather than constructing queue jobs ad hoc.
8. Run at least `pnpm lint:typescript`; run worker-related tests when available.

## Self-check

- Queue and worker use the same `QUEUE_NAME`.
- Worker is correctly closed in shutdown.
- Queue is visible in `/admin/queues`.
- Payload does not use `any`; `JobData` is typed.
- Shutdown still closes every existing worker.

## Reference Examples

- Standard queue/worker pair: `src/mq/scenario-metadata-generation/queue.ts`, `src/mq/scenario-metadata-generation/worker.ts`.
- Scheduled queue/worker pair: `src/mq/subscriptions-charge/queue.ts`, `src/mq/subscriptions-charge/worker.ts`.
- Worker with `types.ts` and `utils.ts`: `src/mq/scenario-version-export/**`.
- Startup/shutdown registration: `src/entrypoints/workers.ts`.
- Bull Board registration: `src/entrypoints/server.ts`.
