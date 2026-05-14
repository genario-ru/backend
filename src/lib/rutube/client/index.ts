import { env } from "@/env";
import {
  type Client,
  createApiClient,
  type RequestConfig,
  type ResponseConfig,
  type ResponseErrorConfig,
} from "@/lib/api-client";

export const client: Client = createApiClient({
  baseUrl: env.RUTUBE_BASE_API_URL,
});

export type { Client, RequestConfig, ResponseConfig, ResponseErrorConfig };

export default client;
