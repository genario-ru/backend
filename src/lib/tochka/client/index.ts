import { envs } from "@/constants/shared/common/envs";
import {
  type Client,
  createApiClient,
  type RequestConfig,
  type ResponseConfig,
  type ResponseErrorConfig,
} from "@/lib/api-client";

export const client: Client = createApiClient({
  baseUrl: envs.TOCHKA_BASE_API_URL,
  defaultHeaders: {
    Authorization: `Bearer ${envs.TOCHKA_JWT_TOKEN}`,
  },
});

export type { Client, RequestConfig, ResponseConfig, ResponseErrorConfig };

export default client;
