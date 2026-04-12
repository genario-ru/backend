# Add BullMQ Worker

Add a new background job queue + worker following the project pattern.

## Arguments

`$ARGUMENTS` — description of the job (e.g. "pdf export for ideas list" or "email notification on subscription change").

## Pre-coding step (mandatory)

Before writing any code, read at least **3 similar queue/worker pairs** in `src/mq/`:

```bash
ls src/mq/
```

List the reference paths before writing code.

## Step 1 — Create `src/mq/<domain>-<action>/queue.ts`

```typescript
import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

export const MY_JOB_QUEUE_NAME = "my-domain-action";

export type MyJobData = {
  entityId: string;
  userId: string;
};

export const myJobQueue = new Queue<MyJobData>(MY_JOB_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});

export function enqueueMyJob(data: MyJobData) {
  return myJobQueue.add("my-domain-action", data);
}
```

## Step 2 — Create `src/mq/<domain>-<action>/worker.ts`

```typescript
import { Worker } from "bullmq";
import { redis } from "@/lib/redis";
import { MY_JOB_QUEUE_NAME, type MyJobData } from "./queue";

export const myJobWorker = new Worker<MyJobData>(
  MY_JOB_QUEUE_NAME,
  async (job) => {
    const { entityId, userId } = job.data;

    console.log("Worker started", job.data);

    try {
      // ... processing logic
    } catch (error) {
      console.error("Worker failed", { jobId: job.id, error });
      throw error; // re-throw so BullMQ marks job as failed and retries
    }
  },
  { connection: redis },
);
```

## Step 3 — Register in `src/entrypoints/workers.ts`

```typescript
import { myJobWorker } from "@/mq/my-domain-action/worker";

// In shutdown():
await myJobWorker.close();
```

## Step 4 — Register queue in Bull Board (`src/entrypoints/server.ts`)

```typescript
import { myJobQueue } from "@/mq/my-domain-action/queue";

// In createBullBoard({ queues: [...] }):
new BullMQAdapter(myJobQueue),
```

## Finish checklist

- [ ] `QUEUE_NAME` constant is identical in `queue.ts` and `worker.ts`
- [ ] `JobData` is fully typed (no `any`)
- [ ] Worker is imported and closed in `workers.ts` shutdown
- [ ] Queue is added to Bull Board in `server.ts`
- [ ] Queue visible at `/admin/queues` when server starts
- Run: `pnpm lint:fix && pnpm lint:typescript`
