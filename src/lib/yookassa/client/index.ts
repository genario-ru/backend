import { env } from "@/env";
import {
  type Client,
  createApiClient,
  type RequestConfig,
  type ResponseConfig,
  type ResponseErrorConfig,
} from "@/lib/api-client";

const auth = Buffer.from(
  `${env.YOOKASSA_SHOP_ID}:${env.YOOKASSA_SECRET_KEY}`,
  "utf8",
).toString("base64");

export const client: Client = createApiClient({
  baseUrl: env.YOOKASSA_BASE_URL,
  defaultHeaders: {
    Authorization: `Basic ${auth}`,
  },
});

export type { Client, RequestConfig, ResponseConfig, ResponseErrorConfig };

export default client;
