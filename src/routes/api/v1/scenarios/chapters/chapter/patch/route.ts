import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { scenarioChapter } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { updateScenarioChapterBodySchema } from "@/schemas/entities/scenarios/handlers/update-scenario-chapter/body";
import { updateScenarioChapterParamsSchema } from "@/schemas/entities/scenarios/handlers/update-scenario-chapter/params";
import {
  type UpdateScenarioChapterResponse,
  updateScenarioChapterResponseSchema,
} from "@/schemas/entities/scenarios/handlers/update-scenario-chapter/response";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

export const updateScenarioChapterRoute = createHonoApp().basePath(
  "/scenarios/chapters/:chapterId",
);

// PATCH /api/v1/scenarios/chapters/{chapterId}
updateScenarioChapterRoute.patch(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "update-scenario-chapter",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario chapter updated successfully",
        schema: updateScenarioChapterResponseSchema,
      }),
    },
  }),
  validator("param", updateScenarioChapterParamsSchema),
  validator("json", updateScenarioChapterBodySchema),
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
