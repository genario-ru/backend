import { Section, Text } from "@react-email/components";

import type { EmailVerificationPayload } from "@/domains/mail/schemas/payloads/email-verification";

import { EmailButton } from "../components/button";
import { EmailLayout } from "../components/layout";
import { headingStyle } from "../styles/common";
import { mutedTextStyle, textStyle } from "../styles/email-verification-email";

export function EmailVerificationEmail({ url }: EmailVerificationPayload) {
  return (
    <EmailLayout preview="Подтвердите адрес электронной почты">
      <Section>
        <Text style={headingStyle}>Подтверждение почты</Text>
        <Text style={textStyle}>
          Нажмите на кнопку ниже, чтобы подтвердить адрес электронной почты.
        </Text>
        <EmailButton href={url}>Подтвердить почту</EmailButton>
        <Text style={mutedTextStyle}>
          Если кнопка не работает, скопируйте ссылку в браузер: {url}
        </Text>
      </Section>
    </EmailLayout>
  );
}
