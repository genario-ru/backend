import { envs } from "../common/envs";

const FRONTEND_LOCAL_BASE_URL = "http://localhost:5173";
const BACKEND_LOCAL_BASE_URL = "http://localhost:3000";

export const TRUSTED_ORIGINS = [
  envs.FRONTEND_BASE_URL,
  envs.BACKEND_BASE_URL,
  FRONTEND_LOCAL_BASE_URL,
  BACKEND_LOCAL_BASE_URL,
];
