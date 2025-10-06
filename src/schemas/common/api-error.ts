import { z } from "zod";
import { zHTTPErrorCode, zHTTPErrorStatusCode } from "./http-error";
import { APIErrorCode, APIErrorStatusCode } from "@/types/api-error";

export const zAPIErrorCode = z.enum(APIErrorCode);
export const zAPIErrorStatusCode = z.enum(APIErrorStatusCode);

export type APIErrorCodeType = `${APIErrorCode}`;
export type APIErrorStatusCodeType = `${APIErrorStatusCode}`;

export const zAPIErrorSchema = z.object({
  code: zHTTPErrorCode.describe("Код ошибки"),
  statusCode: zHTTPErrorStatusCode.describe("HTTP статус код"),
  message: z.string().describe("Человеко-читаемое описание ошибки"),
  details: z.unknown().optional().describe("Дополнительные данные об ошибке"),
});

export type APIErrorSchema = z.infer<typeof zAPIErrorSchema>;
