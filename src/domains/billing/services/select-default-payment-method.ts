import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { paymentMethod } from "@/db/schema";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

type SelectDefaultPaymentMethodParams = {
  userId: string;
  paymentMethodId: string;
};

export async function selectDefaultPaymentMethod({
  userId,
  paymentMethodId,
}: SelectDefaultPaymentMethodParams) {
  return db.transaction(async (tx) => {
    const foundPaymentMethod = await tx.query.paymentMethod.findFirst({
      where: (paymentMethod, { and, eq }) =>
        and(
          eq(paymentMethod.id, paymentMethodId),
          eq(paymentMethod.userId, userId),
          eq(paymentMethod.status, "active"),
        ),
    });

    if (!foundPaymentMethod) {
      throw throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный активный метод оплаты не существует или у вас нет прав на его изменение",
      });
    }

    if (foundPaymentMethod.default) {
      return foundPaymentMethod;
    }

    await tx
      .update(paymentMethod)
      .set({ default: false })
      .where(
        and(eq(paymentMethod.userId, userId), eq(paymentMethod.default, true)),
      );

    const [updatedPaymentMethod] = await tx
      .update(paymentMethod)
      .set({ default: true })
      .where(
        and(
          eq(paymentMethod.id, paymentMethodId),
          eq(paymentMethod.userId, userId),
        ),
      )
      .returning();

    return updatedPaymentMethod;
  });
}
