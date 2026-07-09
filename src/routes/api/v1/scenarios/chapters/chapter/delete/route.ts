import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { scenarioChapter } from "@/db/schema";
import { deleteScenarioChapterParamsSchema } from "@/domains/scenarios/schemas/handlers/delete-scenario-chapter/params";
import {
  type DeleteScenarioChapterResponse,
  deleteScenarioChapterResponseSchema,
} from "@/domains/scenarios/schemas/handlers/delete-scenario-chapter/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const deleteScenarioChapterRoute = createHonoApp().basePath(
  "/scenarios/chapters/:chapterId",
);

// DELETE /api/v1/scenarios/chapters/{chapterId}
deleteScenarioChapterRoute.delete(
  "/",
  rateLimitMiddleware({
    keyPrefix: "delete-scenario-chapter",
    windowMs: 3 * 1000,
    limit: 1,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario chapter deleted successfully",
        schema: deleteScenarioChapterResponseSchema,
      }),
    },
  }),
  validator("param", deleteScenarioChapterParamsSchema),
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
      throw throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Раздел сценария не найден",
      });
    }

    if (existingChapter.scenarioVersion.scenario.userId !== user.id) {
      throw throwAPIError({
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
