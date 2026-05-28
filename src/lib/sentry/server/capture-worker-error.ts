import * as Sentry from "@sentry/node";
import type { Job } from "bullmq";

import { isSentryEnabled } from "../utils/is-sentry-enabled";

type CaptureWorkerErrorParams = {
  error: unknown;
  job?: Job | null;
  queueName: string;
};

export function captureWorkerError({
  error,
  job,
  queueName,
}: CaptureWorkerErrorParams) {
  if (!isSentryEnabled()) {
    return;
  }

  Sentry.withScope((scope) => {
    scope.setTag("runtime", "workers");
    scope.setTag("queue.name", queueName);

    if (job) {
      scope.setContext("job", {
        id: job.id,
        name: job.name,
        queueName: job.queueName,
        attemptsMade: job.attemptsMade,
      });
    }

    Sentry.captureException(error);
  });
}
