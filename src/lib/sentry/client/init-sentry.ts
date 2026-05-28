import * as Sentry from "@sentry/node";

import { env } from "@/env";

import { isSentryEnabled } from "../utils/is-sentry-enabled";

type InitSentryParams = {
  runtime: "server" | "workers";
};

export function initSentry({ runtime }: InitSentryParams) {
  console.log("Sentry configuration", {
    enabled: isSentryEnabled(),
    hasDsn: Boolean(env.GLITCHTIP_DSN),
    nodeEnv: env.NODE_ENV,
    release: env.GLITCHTIP_RELEASE,
    runtime,
  });

  if (!isSentryEnabled()) {
    return;
  }

  Sentry.init({
    dsn: env.GLITCHTIP_DSN,
    environment: env.NODE_ENV,
    release: env.GLITCHTIP_RELEASE,
    sendDefaultPii: false,
    initialScope: {
      tags: {
        runtime,
      },
    },
  });
}
