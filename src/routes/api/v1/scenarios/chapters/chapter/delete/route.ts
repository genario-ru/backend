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
import { deleteScenarioChapterParamsSchema } from "@/schemas/domains/scenarios/handlers/delete-scenario-chapter/params";
import {
  type DeleteScenarioChapterResponse,
  deleteScenarioChapterResponseSchema,
} from "@/schemas/domains/scenarios/handlers/delete-scenario-chapter/response";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

export const deleteScenarioChapterRoute = createHonoApp().basePath(
  "/scenarios/chapters/:chapterId",
);

// DELETE /api/v1/scenarios/chapters/{chapterId}
deleteScenarioChapterRoute.delete(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "delete-scenario-chapter",
    windowMs: 60 * 1000,
    limit: 10,
  }),
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
