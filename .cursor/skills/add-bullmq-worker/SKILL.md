---
name: add-bullmq-worker
description: Adds a new BullMQ queue and worker in backend with mandatory registration in workers shutdown and Bull Board. Use when introducing new background jobs in src/mq.
---

# Add BullMQ Worker

## Goal

Create a new background processing module without missing integration steps.

## Steps

1. Create folder `src/mq/<domain>/<feature>/`.
2. Add `queue.ts`:
   - queue name constant;
   - `Queue<JobData>` with shared Redis configuration;
   - `enqueue...(...)` helper.
3. Add `worker.ts`:
   - `Worker<JobData>`;
   - job handler with input validation;
   - unified error handling.
4. Update `src/entrypoints/workers.ts`:
   - import worker;
   - add `await worker.close()` in `shutdown`.
5. Update `src/entrypoints/server.ts`:
   - import queue;
   - add `new BullMQAdapter(queue)` to `createBullBoard`.

## Self-check

- Queue and worker use the same `QUEUE_NAME`.
- Worker is correctly closed in shutdown.
- Queue is visible in `/admin/queues`.
- Payload does not use `any`; `JobData` is typed.
