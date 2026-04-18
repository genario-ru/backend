import { envs } from "@/shared/constants/common/envs";

import { mailTransporter } from "../client";

export type SendMailParams = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendMail({
  to,
  subject,
  html,
  text,
}: SendMailParams): Promise<{ messageId: string }> {
  const info = await mailTransporter.sendMail({
    from: envs.SMTP_FROM,
    to,
    subject,
    html,
    text,
  });

  return { messageId: info.messageId };
}
