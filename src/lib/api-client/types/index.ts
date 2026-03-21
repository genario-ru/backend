export type Method = "GET" | "PUT" | "PATCH" | "POST" | "DELETE";

export type ResponseType =
  | "arraybuffer"
  | "blob"
  | "document"
  | "json"
  | "text"
  | "stream";

export type RequestConfig<TVariables = unknown> = {
  method: Method;
  url?: string;
  params?: object;
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

export type Client = <TData = unknown, _TError = unknown, TVariables = unknown>(
  config: RequestConfig<TVariables>,
) => Promise<ResponseConfig<TData>>;

export type CreateApiClientOptions = {
  baseUrl: string;
  defaultHeaders?: HeadersInit;
};
