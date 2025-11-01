import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { scenarioChapter } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { deleteScenarioChapterParamsSchema } from "@/schemas/entities/scenarios/handlers/delete-scenario-chapter/params";
import {
  type DeleteScenarioChapterResponse,
  deleteScenarioChapterResponseSchema,
} from "@/schemas/entities/scenarios/handlers/delete-scenario-chapter/response";
import { createHonoApp } from "@/utils/create-hono-app";
import { throwAPIError } from "@/utils/throw-api-error";

export const deleteScenarioChapterRoute = createHonoApp().basePath(
  "/scenarios/chapters/:chapterId",
);

// DELETE /api/v1/scenarios/chapters/{chapterId}
deleteScenarioChapterRoute.delete(
  "/",
  sessionMiddleware,
  zValidator("param", deleteScenarioChapterParamsSchema),
  async (c) => {
    const { chapterId } = c.req.valid("param");
    const user = c.get("user");

    // Проверяем владельца через JOIN
    const existingChapter = await db.query.scenarioChapter.findFirst({
      where: (scenarioChapter, { eq }) => eq(scenarioChapter.id, chapterId),
      with: {
        scenarioVersion: {
          with: {
            scenario: true,
          },
        },
      },
    });

    if (!existingChapter) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Раздел сценария не найден",
      });
    }

    if (existingChapter.scenarioVersion.scenario.userId !== user.id) {
      return throwAPIError({
        code: APIErrorCode.Forbidden,
        message: "У вас нет доступа к этому разделу сценария",
      });
    }

    const [deletedChapter] = await db
      .delete(scenarioChapter)
      .where(eq(scenarioChapter.id, chapterId))
      .returning();

    return c.json<DeleteScenarioChapterResponse>(
      deleteScenarioChapterResponseSchema.parse({
        data: deletedChapter,
      }),
    );
  },
);
