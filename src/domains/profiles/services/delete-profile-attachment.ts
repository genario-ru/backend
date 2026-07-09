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
  const foundProfileAttachment = await db.query.profileAttachment.findFirst({
    where: (profileAttachmentTable, { eq: eqFn }) =>
      eqFn(profileAttachmentTable.attachmentId, attachmentId),
    with: {
      profile: true,
    },
  });

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
