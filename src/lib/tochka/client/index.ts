import { env } from "@/env";
import {
  type Client,
  createApiClient,
  type RequestConfig,
  type ResponseConfig,
  type ResponseErrorConfig,
} from "@/lib/api-client";

export const client: Client = createApiClient({
  baseUrl: env.TOCHKA_BASE_API_URL,
  defaultHeaders: {
    Authorization: `Bearer ${env.TOCHKA_JWT_TOKEN}`,
  },
});

export type { Client, RequestConfig, ResponseConfig, ResponseErrorConfig };

export default client;
