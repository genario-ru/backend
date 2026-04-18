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

import { APP_NAME_CAPITALIZED } from "@/shared/constants/common/app-info";

import {
  bodyStyle,
  containerStyle,
  footerStyle,
  headerStyle,
  hrStyle,
} from "../styles/layout";

type EmailLayoutProps = {
  preview: string;
  children: ReactNode;
};

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="ru">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Text style={headerStyle}>{APP_NAME_CAPITALIZED}</Text>
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
