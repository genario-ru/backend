import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { scenarioChapter } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { deleteScenarioVersionChapterParamsSchema } from "@/schemas/entities/scenarios/handlers/delete-scenario-version-chapter/params";
import {
  type DeleteScenarioVersionChapterResponse,
  deleteScenarioVersionChapterResponseSchema,
} from "@/schemas/entities/scenarios/handlers/delete-scenario-version-chapter/response";
import { createHonoApp } from "@/utils/create-hono-app";
import { throwAPIError } from "@/utils/throw-api-error";

export const deleteScenarioVersionChapterRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId/versions/:versionId/chapters/:chapterId",
);

// DELETE /api/v1/scenarios/{scenarioId}/versions/{versionId}/chapters/{chapterId}
deleteScenarioVersionChapterRoute.delete(
  "/",
  sessionMiddleware,
  zValidator("param", deleteScenarioVersionChapterParamsSchema),
  async (c) => {
    const { scenarioId, versionId, chapterId } = c.req.valid("param");
    const user = c.get("user");

    // Проверяем, что сценарий принадлежит пользователю
    const scenario = await db.query.scenario.findFirst({
      where: (scenario, { eq, and }) =>
        and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)),
    });

    if (!scenario) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Сценарий не найден",
      });
    }

    // Проверяем, что версия принадлежит сценарию
    const version = await db.query.scenarioVersion.findFirst({
      where: (scenarioVersion, { eq, and }) =>
        and(
          eq(scenarioVersion.id, versionId),
          eq(scenarioVersion.scenarioId, scenarioId),
        ),
    });

    if (!version) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Версия сценария не найдена",
      });
    }

    // Проверяем, что chapter принадлежит версии
    const existingChapter = await db.query.scenarioChapter.findFirst({
      where: (scenarioChapter, { eq, and }) =>
        and(
          eq(scenarioChapter.id, chapterId),
          eq(scenarioChapter.scenarioVersionId, versionId),
        ),
    });

    if (!existingChapter) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Раздел сценария не найден",
      });
    }

    const [deletedChapter] = await db
      .delete(scenarioChapter)
      .where(
        and(
          eq(scenarioChapter.id, chapterId),
          eq(scenarioChapter.scenarioVersionId, versionId),
        ),
      )
      .returning();

    return c.json<DeleteScenarioVersionChapterResponse>(
      deleteScenarioVersionChapterResponseSchema.parse({
        data: deletedChapter,
      }),
    );
  },
);
