import { documentTypes } from "../constants/document-types";

export async function parseErrorResponseData(response: Response) {
  const contentType = response.headers.get("Content-Type");

  if (contentType?.includes(documentTypes.json)) {
    return response.json();
  }

  if (
    contentType?.includes(documentTypes.text) ||
    contentType?.includes(documentTypes.html)
  ) {
    return response.text();
  }

  return undefined;
}
