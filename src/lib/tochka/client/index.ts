import {
  type Client,
  createApiClient,
  type RequestConfig,
  type ResponseConfig,
  type ResponseErrorConfig,
} from "@/lib/api-client";
import { envs } from "@/shared/constants/common/envs";

export const client: Client = createApiClient({
  baseUrl: envs.TOCHKA_BASE_API_URL,
  defaultHeaders: {
    Authorization: `Bearer ${envs.TOCHKA_JWT_TOKEN}`,
  },
});

export type { Client, RequestConfig, ResponseConfig, ResponseErrorConfig };

export default client;
