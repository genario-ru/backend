import { envs } from "@/constants/common/envs";
import { prepareQueryString } from "@/utils/api/prepare-query-string";

type Method = "GET" | "PUT" | "PATCH" | "POST" | "DELETE";
type ResponseType = "json" | "text";

export type RequestConfig<TVariables = unknown> = {
  method: Method;
  url: string;
  params?: Record<string, string | number | boolean | null | undefined>;
  data?: TVariables | FormData;
  headers?: HeadersInit;
  signal?: AbortSignal;
  responseType?: ResponseType;
};

export type ResponseConfig<TData = unknown> = {
  data: TData;
  status: number;
  statusText: string;
};

export type ResponseErrorConfig<TError = unknown> = TError & {
  status: number;
  statusText: string;
  url: string;
  data?: unknown;
};

export type Client = <
  TData = unknown,
  _TError = ResponseErrorConfig,
  TVariables = unknown,
>(
  config: RequestConfig<TVariables>,
) => Promise<ResponseConfig<TData>>;

// ──────────────────────────────────────────────
// Основной клиент (Kubb-compatible)
// ──────────────────────────────────────────────

export const client: Client = async ({
  url,
  method,
  params,
  data,
  signal,
  headers: initialHeaders,
  responseType = "json",
}) => {
  const urlWithBase = `${envs.RUTUBE_BASE_API_URL.replace(/\/$/, "")}${url}`;

  const queryString = prepareQueryString({
    queryParams: params,
    includeQuestionmark: true,
  });

  const headers = new Headers({
    Accept: "application/json",
    ...initialHeaders,
  });

  const fullUrl = `${urlWithBase}${queryString}`;
  const isFormData = data instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(fullUrl.toString(), {
    method,
    headers,
    body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    signal,
  });

  if (!response.ok) {
    let errorData: unknown;

    try {
      if (responseType === "json") {
        errorData = await response.json();
      }

      errorData = await response.text();
    } catch {
      errorData = null;
    }

    const error: ResponseErrorConfig = {
      status: response.status,
      statusText: response.statusText,
      url: fullUrl.toString(),
      data: errorData,
    };

    throw error;
  }

  let responseData;

  switch (responseType) {
    case "text":
      responseData = await response.text();
      break;

    default:
      responseData = await response.json();
  }

  return {
    data: responseData,
    status: response.status,
    statusText: response.statusText,
  };
};

export default client;
