import { Section, Text } from "@react-email/components";

import type { SubscriptionPaymentFailedPayload } from "@/domains/mail/schemas/payloads/subscription-payment-failed";

import { EmailButton } from "../components/button";
import { EmailLayout } from "../components/layout";
import { headingStyle } from "../styles/common";
import {
  detailLabelStyle,
  detailsStyle,
  detailValueStyle,
  mutedTextStyle,
  textStyle,
} from "../styles/subscription-payment-failed-email";

export function SubscriptionPaymentFailedEmail({
  billingUrl,
  tariffName,
  tariffPrice,
}: SubscriptionPaymentFailedPayload) {
  const formattedTariffPrice = new Intl.NumberFormat("ru-RU", {
    currency: "RUB",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(tariffPrice);

  return (
    <EmailLayout preview="Не удалось провести оплату тарифа">
      <Section>
        <Text style={headingStyle}>Не удалось провести оплату</Text>
        <Text style={textStyle}>
          Мы не смогли списать оплату за вашу подписку. Проверьте способ оплаты
          или добавьте новый, чтобы сохранить доступ к сервису.
        </Text>
        <Section style={detailsStyle}>
          <Text style={detailLabelStyle}>Тариф</Text>
          <Text style={detailValueStyle}>{tariffName}</Text>
          <Text style={detailLabelStyle}>Сумма</Text>
          <Text style={detailValueStyle}>{formattedTariffPrice}</Text>
        </Section>
        <EmailButton href={billingUrl}>Перейти к способам оплаты</EmailButton>
        <Text style={mutedTextStyle}>
          Мы повторим попытку списания позже. Если оплата не пройдет несколько
          раз, подписка будет остановлена.
        </Text>
      </Section>
    </EmailLayout>
  );
}
