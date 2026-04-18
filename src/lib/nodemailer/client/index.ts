import nodemailer from "nodemailer";

import { envs } from "@/shared/constants/common/envs";

export const mailTransporter = nodemailer.createTransport({
  host: envs.SMTP_HOST,
  port: envs.SMTP_PORT,
  secure: envs.SMTP_SECURE,
  auth:
    envs.SMTP_USER || envs.SMTP_PASSWORD
      ? {
          user: envs.SMTP_USER,
          pass: envs.SMTP_PASSWORD,
        }
      : undefined,
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});
