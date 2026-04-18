import { Worker } from "bullmq";
import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { emailLog } from "@/db/schemas/logs/email-log";
import { renderEmail } from "@/domains/mail/utils/render-email";
import { sendMail } from "@/lib/nodemailer";
import { redis } from "@/lib/redis";

import { MAIL_SEND_QUEUE_NAME, type MailSendJobData } from "./queue";

export const mailSendWorker = new Worker<MailSendJobData>(
  MAIL_SEND_QUEUE_NAME,
  async (job) => {
    const { emailLogId, to, templateKey, payload } = job.data;

    console.log("Worker отправки email запущен", { emailLogId, templateKey });

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
      const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);

      await db
        .update(emailLog)
        .set({
          status: isLastAttempt ? "failed" : "pending",
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

mailSendWorker.on("failed", (job, error) => {
  console.error("Worker отправки email упал с ошибкой", job?.toJSON(), error);
});

mailSendWorker.on("completed", (job) => {
  console.log("Worker отправки email отработал успешно", job.id);
});
