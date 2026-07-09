import { validator } from "hono-openapi";

import { db } from "@/db";
import { getScenarioChapterParamsSchema } from "@/domains/scenarios/schemas/handlers/get-scenario-chapter/params";
import {
  type GetScenarioChapterResponse,
  getScenarioChapterResponseSchema,
} from "@/domains/scenarios/schemas/handlers/get-scenario-chapter/response";
import { getSignedS3Url } from "@/lib/s3/utils/get-signed-s3-url";
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

export const getScenarioChapterRoute = createHonoApp().basePath(
  "/scenarios/chapters/:chapterId",
);

// GET /api/v1/scenarios/chapters/{chapterId}
getScenarioChapterRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-scenario-chapter",
    windowMs: 1000,
    limit: 2,
  }),
  sessionMiddleware,
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
        productionStatus: true,
      },
    });

    if (!chapter) {
      throw throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Раздел сценария не найден",
      });
    }

    if (chapter.scenarioVersion.scenario.userId !== user.id) {
      throw throwAPIError({
        code: APIErrorCode.Forbidden,
        message: "У вас нет доступа к этому разделу сценария",
      });
    }

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
