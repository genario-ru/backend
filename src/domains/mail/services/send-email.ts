import { db } from "@/db";
import { emailLog } from "@/db/schemas/logs/email-log";
import type { EmailTemplateKey } from "@/domains/mail/constants/template-keys";
import {
  type EmailPayloadByKey,
  emailPayloadSchemas,
} from "@/domains/mail/schemas/payloads";
import { buildEmailSubject } from "@/domains/mail/utils/render-email";
import { enqueueMailSend } from "@/mq/mail-send/queue";
import { envs } from "@/shared/constants/common/envs";

export type SendEmailParams<K extends EmailTemplateKey> = {
  to: string;
  templateKey: K;
  payload: EmailPayloadByKey[K];
  userId?: string;
};

export async function sendEmail<K extends EmailTemplateKey>({
  to,
  templateKey,
  payload,
  userId,
}: SendEmailParams<K>): Promise<{ emailLogId: string }> {
  const schema = emailPayloadSchemas[templateKey];
  const validPayload = schema.parse(payload) as EmailPayloadByKey[K];

  const subject = buildEmailSubject(templateKey, validPayload);
  const from = envs.SMTP_FROM;

  const [created] = await db
    .insert(emailLog)
    .values({
      userId,
      to,
      from,
      subject,
      templateKey,
      status: "pending",
    })
    .returning({ id: emailLog.id });

  if (!created) {
    throw new Error("Failed to insert email log row");
  }

  await enqueueMailSend({
    emailLogId: created.id,
    to,
    templateKey,
    payload: validPayload,
  });

  return { emailLogId: created.id };
}
