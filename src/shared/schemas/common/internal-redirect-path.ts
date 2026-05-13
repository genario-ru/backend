import { z } from "@/lib/zod";

function isValidInternalRedirectPath(value: string) {
  if (!value.startsWith("/")) {
    return false;
  }

  if (value.startsWith("//") || value.includes("\\")) {
    return false;
  }

  if (/[\u0000-\u001F\u007F]/.test(value)) {
    return false;
  }

  return true;
}

export const internalRedirectPathSchema = z
  .string()
  .refine(isValidInternalRedirectPath, {
    message: "Redirect path must be an internal application path",
  });
