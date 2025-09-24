import { HTTPErrorCode, HTTPErrorStatusCode } from "@/types/http-error";
import { z } from "zod";

export const zHTTPErrorCode = z.enum(HTTPErrorCode);
export const zHTTPErrorStatusCode = z.enum(HTTPErrorStatusCode);

export type HTTPErrorCodeType = `${HTTPErrorCode}`;
export type HTTPErrorStatusCodeType = `${HTTPErrorStatusCode}`;
