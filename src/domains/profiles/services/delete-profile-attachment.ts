import { eq } from "drizzle-orm";

import { db } from "@/db";
import { attachment } from "@/db/schema";
import type { Attachment } from "@/domains/attachments/schemas/entities/attachment";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

type DeleteProfileAttachmentParams = {
  userId: string;
  attachmentId: string;
};

export async function deleteProfileAttachment({
  userId,
  attachmentId,
}: DeleteProfileAttachmentParams): Promise<Attachment> {
  const [foundImageAttachment, foundVideoAttachment] = await Promise.all([
    db.query.profileImageAttachment.findFirst({
      where: (profileImageAttachmentTable, { eq: eqFn }) =>
        eqFn(profileImageAttachmentTable.attachmentId, attachmentId),
      with: {
        profile: true,
      },
    }),
    db.query.profileVideoAttachment.findFirst({
      where: (profileVideoAttachmentTable, { eq: eqFn }) =>
        eqFn(profileVideoAttachmentTable.attachmentId, attachmentId),
      with: {
        profile: true,
      },
    }),
  ]);

  const foundProfileAttachment =
    foundImageAttachment ?? foundVideoAttachment ?? null;

  if (!foundProfileAttachment) {
    throw throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Вложение не найдено",
    });
  }

  if (foundProfileAttachment.profile.userId !== userId) {
    throw throwAPIError({
      code: APIErrorCode.Forbidden,
      message: "У вас нет доступа к этому вложению",
    });
  }

  const [deletedAttachment] = await db
    .delete(attachment)
    .where(eq(attachment.id, attachmentId))
    .returning();

  return deletedAttachment;
}
