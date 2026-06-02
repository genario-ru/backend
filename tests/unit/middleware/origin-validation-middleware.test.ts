import { testClient } from "hono/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createHonoApp } from "@/shared/utils/server/create-hono-app";

async function createTestClient() {
  const { originValidationMiddleware } =
    await import("@/middleware/origin-validation-middleware");
  const app = createHonoApp();

  const routes = app
    .use(
      originValidationMiddleware({
        trustedOrigins: ["https://trusted.example"],
        trustedIps: ["203.0.113.0/24"],
      }),
    )
    .post("/protected", (c) => c.text("ok"));

  return testClient(routes);
}

async function createIpOnlyTestClient() {
  const { originValidationMiddleware } =
    await import("@/middleware/origin-validation-middleware");
  const app = createHonoApp();

  const routes = app
    .use(
      originValidationMiddleware({
        trustedIps: ["203.0.113.0/24"],
      }),
    )
    .post("/webhook", (c) => c.text("ok"));

  return testClient(routes);
}

async function postProtected(
  client: Awaited<ReturnType<typeof createTestClient>>,
  headers: Record<string, string>,
) {
  return client.protected.$post(
    {},
    {
      headers,
    },
  );
}

describe("originValidationMiddleware", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "development");
  });

  it("allows unsafe requests from configured local development IPs", async () => {
    const client = await createTestClient();
    const response = await postProtected(client, {
      "origin": "https://local-frontend.example",
      "x-forwarded-for": "198.51.100.50, 203.0.113.10",
    });

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("ok");
  });

  it("rejects unsafe requests from non-allowlisted IPs with untrusted origin", async () => {
    const client = await createTestClient();
    const response = await postProtected(client, {
      "origin": "https://local-frontend.example",
      "x-forwarded-for": "198.51.100.50",
    });

    expect(response.status).toBe(403);
  });

  it("allows unsafe requests without origin from trusted IPs", async () => {
    const client = await createIpOnlyTestClient();
    const response = await client.webhook.$post(
      {},
      {
        headers: {
          "x-forwarded-for": "198.51.100.50, 203.0.113.10",
        },
      },
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("ok");
  });
});
