import { documentTypes } from "../constants/document-types";
import type { ResponseType } from "../types";

export async function parseResponseData<TData>(
  response: Response,
  responseType: ResponseType,
) {
  switch (responseType) {
    case "arraybuffer":
      return (await response.arrayBuffer()) as TData;

    case "blob":
      return (await response.blob()) as TData;

    case "text":
    case "document":
    case "stream":
      return (await response.text()) as TData;

    default: {
      const contentType = response.headers.get("Content-Type");

      if (!contentType?.includes(documentTypes.json)) {
        throw new Error("Non-JSON response is not supported");
      }

      return (await response.json()) as TData;
    }
  }
}
