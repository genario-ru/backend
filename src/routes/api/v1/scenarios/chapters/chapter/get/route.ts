import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { getSignedS3Url } from "@/lib/s3/utils/get-signed-s3-url";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { getScenarioChapterParamsSchema } from "@/schemas/domains/scenarios/handlers/get-scenario-chapter/params";
import {
  type GetScenarioChapterResponse,
  getScenarioChapterResponseSchema,
} from "@/schemas/domains/scenarios/handlers/get-scenario-chapter/response";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

export const getScenarioChapterRoute = createHonoApp().basePath(
  "/scenarios/chapters/:chapterId",
);

// GET /api/v1/scenarios/chapters/{chapterId}
getScenarioChapterRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-scenario-chapter",
    windowMs: 60 * 1000,
    limit: 20,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario chapter retrieved successfully",
        schema: getScenarioChapterResponseSchema,
      }),
    },
  }),
  validator("param", getScenarioChapterParamsSchema),
  async (c) => {
    const { chapterId } = c.req.valid("param");
    const user = c.get("user");

    // Получаем chapter со всеми scenes и их components, а также проверяем владельца через JOIN
    const chapter = await db.query.scenarioChapter.findFirst({
      where: (scenarioChapter, { eq }) => eq(scenarioChapter.id, chapterId),
      with: {
        scenarioVersion: {
          with: {
            scenario: true,
          },
        },
        scenes: {
          orderBy: (scenarioScene, { asc }) => [asc(scenarioScene.startTime)],
          with: {
            preview: {
              with: {
                attachment: true,
                compressedAttachment: true,
              },
            },
            components: {
              with: {
                type: true,
              },
            },
          },
        },
      },
    });

    if (!chapter) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Раздел сценария не найден",
      });
    }

    // Проверяем, что сценарий принадлежит пользователю
    if (chapter.scenarioVersion.scenario.userId !== user.id) {
      return throwAPIError({
        code: APIErrorCode.Forbidden,
        message: "У вас нет доступа к этому разделу сценария",
      });
    }

    // Убираем вложенные данные для response
    const { scenarioVersion: _scenarioVersion, ...chapterData } = chapter;

    const scenes = await Promise.all(
      chapterData.scenes.map(async (scene) => {
        if (!scene.preview) {
          return scene;
        }

        const { attachment, compressedAttachment, ...preparedScenePreview } =
          scene.preview;

        const [url, urlCompressed] = await Promise.all([
          attachment ? getSignedS3Url(attachment.key) : null,
          compressedAttachment
            ? getSignedS3Url(compressedAttachment.key)
            : null,
        ]);

        return {
          ...scene,
          preview: {
            ...preparedScenePreview,
            url,
            urlCompressed,
          },
        };
      }),
    );

    return c.json<GetScenarioChapterResponse>(
      getScenarioChapterResponseSchema.parse({
        data: {
          ...chapterData,
          scenes,
        },
      }),
    );
  },
);
