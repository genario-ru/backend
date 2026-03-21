import { prepareQueryString } from "@/utils/api/prepare-query-string";

import type {
  Client,
  CreateApiClientOptions,
  RequestConfig,
  ResponseConfig,
  ResponseErrorConfig,
} from "../types";
import { parseErrorResponseData } from "./parse-error-response-data";
import { parseResponseData } from "./parse-response-data";
import { prepareRequestBody } from "./prepare-request-body";

export function createApiClient(options: CreateApiClientOptions): Client {
  const { baseUrl, defaultHeaders } = options;

  return async function request<
    TData,
    _TError = unknown,
    TVariables = unknown,
  >({
    url = "",
    method,
    params,
    data,
    signal,
    headers: initialHeaders,
    responseType = "json",
  }: RequestConfig<TVariables>): Promise<ResponseConfig<TData>> {
    const headers = new Headers(defaultHeaders);

    if (initialHeaders) {
      new Headers(initialHeaders).forEach((value, key) => {
        headers.set(key, value);
      });
    }

    const requestBody = prepareRequestBody(data, headers);

    const queryString = prepareQueryString({
      queryParams: params,
      includeQuestionmark: true,
    });

    const fullUrl = `${baseUrl}${url}${queryString}`;

    try {
      const response = await fetch(fullUrl, {
        method,
        headers,
        body: requestBody,
        signal,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await parseErrorResponseData(response);

        const error: ResponseErrorConfig = {
          status: response.status,
          statusText: response.statusText,
          url: fullUrl,
          data: errorData,
        };

        throw error;
      }

      const data = await parseResponseData<TData>(response, responseType);

      return {
        data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      throw error;
    }
  };
}
