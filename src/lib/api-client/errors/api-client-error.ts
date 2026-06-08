type ApiClientErrorParams = {
  status: number;
  statusText: string;
  url: string;
  data?: unknown;
};

// Ошибка не-2xx ответа внешнего API. Бросается настоящим Error (со стеком),
// чтобы errorHandler и Sentry/Glitchtip могли корректно ее классифицировать и
// залогировать, а не получать безликий plain-объект.

export class ApiClientError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly data?: unknown;

  constructor({ status, statusText, url, data }: ApiClientErrorParams) {
    super(`API request to ${url} failed with status ${status} ${statusText}`);

    this.name = "ApiClientError";
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.data = data;
  }
}
