import { Queue } from "bullmq";

import type { EmailTemplateKey } from "@/domains/mail/constants/template-keys";
import type { EmailPayloadByKey } from "@/domains/mail/schemas/payloads";
import { redis } from "@/lib/redis";

export type MailSendJobData = {
  [K in EmailTemplateKey]: {
    emailLogId: string;
    to: string;
    templateKey: K;
    payload: EmailPayloadByKey[K];
  };
}[EmailTemplateKey];

export const MAIL_SEND_QUEUE_NAME = "mail-send";

export const mailSendQueue = new Queue<MailSendJobData>(MAIL_SEND_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 200,
    removeOnFail: 500,
  },
});

export function enqueueMailSend<K extends EmailTemplateKey>(data: {
  emailLogId: string;
  to: string;
  templateKey: K;
  payload: EmailPayloadByKey[K];
}) {
  return mailSendQueue.add("send-mail", data as MailSendJobData, {
    jobId: data.emailLogId,
  });
}
