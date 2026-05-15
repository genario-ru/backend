import { Worker } from "bullmq";
import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { emailLog } from "@/db/schemas/logs/email-log";
import { renderEmail } from "@/domains/mail/utils/render-email";
import { sendMail } from "@/lib/nodemailer";
import { redis } from "@/lib/redis";
import { getSafeJobLogContext } from "@/shared/utils/mq/get-safe-job-log-context";
import { isFinalJobFailure } from "@/shared/utils/mq/is-final-job-failure";

import { MAIL_SEND_QUEUE_NAME, type MailSendJobData } from "./queue";

export const mailSendWorker = new Worker<MailSendJobData>(
  MAIL_SEND_QUEUE_NAME,
  async (job) => {
    const { emailLogId, to, templateKey, payload } = job.data;

    console.log("Worker отправки email запущен", {
      emailLogId,
      templateKey,
    });

    try {
      const rendered = await renderEmail({ templateKey, payload });

      const { messageId } = await sendMail({
        to,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      });

      await db
        .update(emailLog)
        .set({
          status: "sent",
          messageId,
          error: null,
          sentAt: new Date().toISOString(),
          attempts: sql`${emailLog.attempts} + 1`,
        })
        .where(eq(emailLog.id, emailLogId));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      await db
        .update(emailLog)
        .set({
          error: errorMessage,
          attempts: sql`${emailLog.attempts} + 1`,
        })
        .where(eq(emailLog.id, emailLogId));

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 3,
    limiter: {
      max: 10,
      duration: 1000,
    },
  },
);

mailSendWorker.on("error", (error) => {
  console.error("Worker отправки email отработал с ошибкой", error);
});

mailSendWorker.on("failed", async (job, error) => {
  console.error(
    "Worker отправки email упал с ошибкой",
    getSafeJobLogContext(job),
    error,
  );

  const isFinalFailure = await isFinalJobFailure(job);

  if (!job || !isFinalFailure) {
    return;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  try {
    await db
      .update(emailLog)
      .set({
        status: "failed",
        error: errorMessage,
      })
      .where(eq(emailLog.id, job.data.emailLogId));
  } catch (updateError) {
    console.error("Не удалось обновить статус отправки email", updateError);
  }
});

mailSendWorker.on("completed", (job) => {
  console.log("Worker отправки email отработал успешно", job.id);
});
