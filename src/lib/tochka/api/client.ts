import { documentTypes } from "@/constants/api/document-types";
import { envs } from "@/constants/common/envs";
import { prepareQueryString } from "@/utils/api/prepare-query-string";

export type APIErrorInfo = {
  url: string;
  status: number;
  statusText: string;
  data?: unknown;
};

export class APIError extends Error {
  constructor(
    message: string,
    public cause: APIErrorInfo,
  ) {
    super(message);
    this.name = "FetchFnError";
  }
}

type Method = "GET" | "PUT" | "PATCH" | "POST" | "DELETE" | "OPTIONS" | "HEAD";

type ResponseType =
  | "arraybuffer"
  | "blob"
  | "document"
  | "json"
  | "text"
  | "stream";

export type RequestConfig<TData = unknown> = {
  url?: string;
  method: Method;
  params?: object;
  data?: TData | FormData;
  responseType?: ResponseType;
  signal?: AbortSignal;
  headers?: HeadersInit;
};

export type ResponseConfig<TData = unknown> = {
  data: TData;
  status: number;
  statusText: string;
};

export type Client = <TData, _TError = unknown, TVariables = unknown>(
  config: RequestConfig<TVariables>,
) => Promise<ResponseConfig<TData>>;

export type ResponseErrorConfig<TError = unknown> = TError;

export default async function client<
  TData,
  _TError = APIErrorInfo,
  TVariables = unknown,
>({
  url,
  method,
  params,
  data: body,
  signal,
  headers: initialHeaders,
}: RequestConfig<TVariables>): Promise<ResponseConfig<TData>> {
  const headers = new Headers({
    "Content-Type": "application/json",
    ...initialHeaders,
  });

  const urlWithBase = `${envs.TOCHKA_BASE_API_URL}${url}`;

  const queryString = prepareQueryString({
    queryParams: params,
    includeQuestionmark: true,
  });

  const fullUrl = `${urlWithBase}${queryString}`;

  try {
    const response = await fetch(fullUrl, {
      method,
      body: JSON.stringify(body),
      signal,
      headers,
    });

    const contentType = response.headers.get("Content-Type");

    if (!contentType?.includes(documentTypes.json)) {
      throw new APIError("Non-JSON response is not supported", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
    }

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(`HTTP Error ${response.status}`, {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        data,
      });
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    console.log("error", error);

    if (error instanceof APIError) {
      throw error;
    }

    // Process network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new APIError("Network error", {
        status: 0,
        statusText: "Network request failed",
        url: fullUrl,
        data: error.cause,
      });
    }

    // Process unknown errors
    throw new APIError("Unknown error", {
      status: 0,
      statusText: "Unknown error occurred",
      url: fullUrl,
      data: error instanceof Error ? error.cause : error,
    });
  }
}
