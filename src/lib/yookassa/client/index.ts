import { envs } from "@/constants/shared/common/envs";
import {
  type Client,
  createApiClient,
  type RequestConfig,
  type ResponseConfig,
  type ResponseErrorConfig,
} from "@/lib/api-client";

const auth = Buffer.from(
  `${envs.YOOKASSA_SHOP_ID}:${envs.YOOKASSA_SECRET_KEY}`,
  "utf8",
).toString("base64");

export const client: Client = createApiClient({
  baseUrl: envs.YOOKASSA_BASE_URL,
  defaultHeaders: {
    Authorization: `Basic ${auth}`,
  },
});

export type { Client, RequestConfig, ResponseConfig, ResponseErrorConfig };

export default client;
