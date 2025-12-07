import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { scenarioChapter } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { updateScenarioChapterBodySchema } from "@/schemas/entities/scenarios/handlers/update-scenario-chapter/body";
import { updateScenarioChapterParamsSchema } from "@/schemas/entities/scenarios/handlers/update-scenario-chapter/params";
import {
  type UpdateScenarioChapterResponse,
  updateScenarioChapterResponseSchema,
} from "@/schemas/entities/scenarios/handlers/update-scenario-chapter/response";
import { createHonoApp } from "@/utils/create-hono-app";
import { throwAPIError } from "@/utils/throw-api-error";

export const updateScenarioChapterRoute = createHonoApp().basePath(
  "/scenarios/chapters/:chapterId",
);

// PATCH /api/v1/scenarios/chapters/{chapterId}
updateScenarioChapterRoute.patch(
  "/",
  sessionMiddleware,
  zValidator("param", updateScenarioChapterParamsSchema),
  zValidator("json", updateScenarioChapterBodySchema),
  async (c) => {
    const { chapterId } = c.req.valid("param");
    const updateData = c.req.valid("json");
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

    const [updatedChapter] = await db
      .update(scenarioChapter)
      .set(updateData)
      .where(eq(scenarioChapter.id, chapterId))
      .returning();

    return c.json<UpdateScenarioChapterResponse>(
      updateScenarioChapterResponseSchema.parse({
        data: updatedChapter,
      }),
    );
  },
);
