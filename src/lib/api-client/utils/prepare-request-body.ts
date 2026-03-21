import { documentTypes } from "../constants/document-types";

export function prepareRequestBody<TData>(
  body: TData | FormData | undefined,
  headers: Headers,
) {
  if (body == null) {
    return undefined;
  }

  if (body instanceof FormData) {
    headers.delete("Content-Type");

    return body;
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", documentTypes.json);
  }

  return JSON.stringify(body);
}
