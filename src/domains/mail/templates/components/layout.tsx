import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

import { getEmailSiteDomain } from "@/domains/mail/utils/get-email-site-domain";
import { APP_NAME_CAPITALIZED } from "@/shared/constants/common/app-info";

import {
  bodyStyle,
  containerStyle,
  footerStyle,
  headerStyle,
  hrStyle,
  siteDomainBadgeStyle,
} from "../styles/layout";

type EmailLayoutProps = {
  preview: string;
  children: ReactNode;
};

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  const siteDomain = getEmailSiteDomain();

  return (
    <Html lang="ru">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Text style={headerStyle}>{APP_NAME_CAPITALIZED}</Text>
            <Text style={siteDomainBadgeStyle}>{siteDomain}</Text>
          </Section>
          {children}
          <Hr style={hrStyle} />
          <Text style={footerStyle}>
            Это автоматическое письмо, отвечать на него не нужно.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
