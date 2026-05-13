import {
  getPaymentMethodsPaymentMethodId,
  getPaymentsPaymentId,
  getRefundsRefundId,
} from "@/codegen/api/yookassa";
import type { PaymentMethodWebhookData } from "@/domains/billing/schemas/entities/payment-method-webhook-data";
import type { PaymentWebhookData } from "@/domains/billing/schemas/entities/payment-webhook-data";
import type { RefundWebhookData } from "@/domains/billing/schemas/entities/refund-webhook-data";
import type { ProcessWebhookBody } from "@/domains/billing/schemas/handlers/process-webhook/body";
import { envs } from "@/shared/constants/common/envs";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export async function verifyWebhook(body: ProcessWebhookBody) {
  switch (body.event) {
    case "payment.succeeded":
    case "payment.canceled":
      return verifyPaymentWebhook(body);

    case "refund.succeeded":
      return verifyRefundWebhook(body);

    case "payment_method.active":
      return verifyPaymentMethodWebhook(body);
  }
}

async function verifyPaymentWebhook(body: PaymentWebhookData) {
  const payment = await getPaymentsPaymentId({
    payment_id: body.object.id,
  });

  assert(payment.id === body.object.id, "Webhook payment id mismatch");

  assert(
    payment.status === body.object.status,
    "Webhook payment status mismatch",
  );

  assert(
    amountMatches(payment.amount, body.object.amount),
    "Webhook payment amount mismatch",
  );

  assert(
    payment.recipient.account_id === envs.YOOKASSA_SHOP_ID,
    "Webhook payment recipient mismatch",
  );
}

async function verifyRefundWebhook(body: RefundWebhookData) {
  const refund = await getRefundsRefundId({
    refund_id: body.object.id,
  });

  assert(refund.id === body.object.id, "Webhook refund id mismatch");

  assert(
    refund.payment_id === body.object.payment_id,
    "Webhook refund payment mismatch",
  );

  assert(
    refund.status === body.object.status,
    "Webhook refund status mismatch",
  );

  assert(
    amountMatches(refund.amount, body.object.amount),
    "Webhook refund amount mismatch",
  );

  const payment = await getPaymentsPaymentId({
    payment_id: refund.payment_id,
  });

  assert(
    payment.recipient.account_id === envs.YOOKASSA_SHOP_ID,
    "Webhook refund recipient mismatch",
  );
}

async function verifyPaymentMethodWebhook(body: PaymentMethodWebhookData) {
  const paymentMethod = await getPaymentMethodsPaymentMethodId({
    payment_method_id: body.object.id,
  });

  assert(
    paymentMethod.id === body.object.id,
    "Webhook payment method id mismatch",
  );

  assert(
    paymentMethod.status === body.object.status,
    "Webhook payment method status mismatch",
  );

  assert(
    paymentMethod.holder.account_id === envs.YOOKASSA_SHOP_ID,
    "Webhook payment method holder mismatch",
  );
}

function assert(condition: unknown, message: string) {
  if (!condition) {
    throwAPIError({
      code: APIErrorCode.Forbidden,
      message,
    });
  }
}

function amountMatches(
  receivedAmount: { value: string; currency: string },
  expectedAmount: { value: string; currency: string },
) {
  return (
    Number(receivedAmount.value) === Number(expectedAmount.value) &&
    receivedAmount.currency === expectedAmount.currency
  );
}
