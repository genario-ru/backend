import * as Sentry from "@sentry/node";
import type { Context } from "hono";

import type { AppEnv } from "@/shared/types/server/app-env";

import { isSentryEnabled } from "../utils/is-sentry-enabled";

export function captureHonoError(error: unknown, c: Context<AppEnv>) {
  if (!isSentryEnabled()) {
    return;
  }

  Sentry.withScope((scope) => {
    const user = c.get("user");

    scope.setTag("runtime", "server");
    scope.setTag("http.method", c.req.method);
    scope.setTag("http.path", c.req.path);
    scope.setContext("request", {
      method: c.req.method,
      path: c.req.path,
      routePath: c.req.routePath,
    });

    if (user) {
      scope.setUser({ id: user.id });
    }

    Sentry.captureException(error);
  });
}
