import { render } from "@react-email/render";
import type { ReactElement } from "react";

import {
  EmailTemplateKey,
  OTP_SUBJECT_BY_TYPE,
} from "@/domains/mail/constants/template-keys";
import type { EmailPayloadByKey } from "@/domains/mail/schemas/payloads";
import { EmailVerificationEmail } from "@/domains/mail/templates/auth/email-verification-email";
import { OtpEmail } from "@/domains/mail/templates/auth/otp-email";

function buildEmail<K extends EmailTemplateKey>(
  templateKey: K,
  payload: EmailPayloadByKey[K],
): { element: ReactElement; subject: string } {
  switch (templateKey) {
    case EmailTemplateKey.OTP: {
      const otpPayload =
        payload as EmailPayloadByKey[typeof EmailTemplateKey.OTP];

      return {
        element: OtpEmail(otpPayload),
        subject: OTP_SUBJECT_BY_TYPE[otpPayload.type],
      };
    }

    case EmailTemplateKey.EmailVerification: {
      const verificationPayload =
        payload as EmailPayloadByKey[typeof EmailTemplateKey.EmailVerification];

      return {
        element: EmailVerificationEmail(verificationPayload),
        subject: "Подтверждение адреса электронной почты",
      };
    }

    default: {
      const exhaustive: never = templateKey;
      throw new Error(`Unknown email template key: ${String(exhaustive)}`);
    }
  }
}

export function buildEmailSubject<K extends EmailTemplateKey>(
  templateKey: K,
  payload: EmailPayloadByKey[K],
): string {
  return buildEmail(templateKey, payload).subject;
}

export type RenderedEmail = {
  html: string;
  text: string;
  subject: string;
};

export async function renderEmail<K extends EmailTemplateKey>(args: {
  templateKey: K;
  payload: EmailPayloadByKey[K];
}): Promise<RenderedEmail> {
  const { element, subject } = buildEmail(args.templateKey, args.payload);

  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);

  return { html, text, subject };
}
