import { Section, Text } from "@react-email/components";

import type { UpcomingSubscriptionChargePayload } from "@/domains/mail/schemas/payloads/upcoming-subscription-charge";

import { EmailLayout } from "../components/layout";
import { headingStyle } from "../styles/common";
import {
  detailLabelStyle,
  detailsStyle,
  detailValueStyle,
  mutedTextStyle,
  textStyle,
} from "../styles/upcoming-subscription-charge-email";

export function UpcomingSubscriptionChargeEmail({
  chargeAt,
  daysBeforeCharge,
  tariffName,
  tariffPrice,
}: UpcomingSubscriptionChargePayload) {
  const chargeDate = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(chargeAt));

  const formattedTariffPrice = new Intl.NumberFormat("ru-RU", {
    currency: "RUB",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(tariffPrice);

  const chargeTimingText =
    daysBeforeCharge === 1 ? "завтра" : `через ${daysBeforeCharge} дня`;

  return (
    <EmailLayout preview={`Оплата тарифа ${chargeTimingText}`}>
      <Section>
        <Text style={headingStyle}>Скоро спишем оплату за тариф</Text>
        <Text style={textStyle}>
          Напоминаем, что {chargeTimingText} запланирована следующая оплата
          вашей подписки.
        </Text>
        <Section style={detailsStyle}>
          <Text style={detailLabelStyle}>Тариф</Text>
          <Text style={detailValueStyle}>{tariffName}</Text>
          <Text style={detailLabelStyle}>Сумма</Text>
          <Text style={detailValueStyle}>{formattedTariffPrice}</Text>
          <Text style={detailLabelStyle}>Дата оплаты</Text>
          <Text style={detailValueStyle}>{chargeDate}</Text>
        </Section>
        <Text style={mutedTextStyle}>
          Если вы не планируете продлевать подписку, отмените ее до даты
          следующего платежа.
        </Text>
      </Section>
    </EmailLayout>
  );
}
