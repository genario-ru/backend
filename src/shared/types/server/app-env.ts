import type { IncomingMessage, ServerResponse } from "node:http";

import type { Env } from "hono";

import type { AuthType } from "@/auth";

export type AppEnv = Env & {
  Bindings: {
    incoming?: IncomingMessage;
    outgoing?: ServerResponse;
  };
  Variables: Partial<AuthType>;
};
