import { Section, Text } from "@react-email/components";

import { OTP_SUBJECT_BY_TYPE } from "@/domains/mail/constants/template-keys";
import type { OtpEmailPayload } from "@/domains/mail/schemas/payloads/otp";

import { EmailLayout } from "../components/layout";
import { headingStyle } from "../styles/common";
import { mutedTextStyle, otpBoxStyle, textStyle } from "../styles/otp-email";

export function OtpEmail({ otp, type }: OtpEmailPayload) {
  return (
    <EmailLayout preview={`Ваш код: ${otp}`}>
      <Section>
        <Text style={headingStyle}>{OTP_SUBJECT_BY_TYPE[type]}</Text>
        <Text style={textStyle}>
          Используйте этот код, чтобы продолжить. Код действует ограниченное
          время.
        </Text>
        <Text style={otpBoxStyle}>{otp}</Text>
        <Text style={mutedTextStyle}>
          Если вы не запрашивали этот код, просто проигнорируйте письмо.
        </Text>
      </Section>
    </EmailLayout>
  );
}
