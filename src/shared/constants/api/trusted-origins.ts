import { env } from "@/env";

const FRONTEND_LOCAL_BASE_URL = "http://localhost:5173";
const BACKEND_LOCAL_BASE_URL = "http://localhost:3000";

export const TRUSTED_ORIGINS = [
  env.FRONTEND_BASE_URL,
  env.BACKEND_BASE_URL,
  FRONTEND_LOCAL_BASE_URL,
  BACKEND_LOCAL_BASE_URL,
];
