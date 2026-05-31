---
name: add-bullmq-worker
description: Use when adding BullMQ queues or workers. Ensures Redis usage, typed payloads, worker shutdown, and Bull Board registration.
---

# Add BullMQ Worker

Use this for background jobs in `src/mq/**`.

1. Inspect at least 3 existing queue/worker pairs.
2. Create a local module such as `src/mq/<domain>/<feature>/`.
3. Add `queue.ts` with a queue name constant, typed `Queue<JobData>`, shared Redis from `@/lib/redis`, and an enqueue helper.
4. Add `worker.ts` with typed `Worker<JobData>` and the existing logging/Sentry/error style.
5. Keep queue name, job name, payload type, and worker `job.data` shape synchronized.
6. Register worker startup and shutdown in `src/entrypoints/workers.ts`; add `await worker.close()` in `shutdown()`.
7. Register the queue in Bull Board inside `src/entrypoints/server.ts` with `new BullMQAdapter(queue)`.
8. Make routes/services call the enqueue helper instead of constructing jobs ad hoc.
9. Run `pnpm lint:typescript` and targeted tests when available.

Never leave a worker without shutdown handling or a queue without Bull Board visibility.
