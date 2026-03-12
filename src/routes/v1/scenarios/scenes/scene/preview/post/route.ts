import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { scenarioScenePreview } from "@/db/schema";
import { getSignedS3Url } from "@/lib/s3/utils/get-signed-s3-url";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { enqueueScenarioScenePreviewGeneration } from "@/mq/scenario/scenario-scene-preview-generation/queue";
import { APIErrorCode } from "@/schemas/common/api-error";
import { createScenarioScenePreviewParamsSchema } from "@/schemas/entities/scenarios/handlers/create-scenario-scene-preview/params";
import {
  type CreateScenarioScenePreviewResponse,
  createScenarioScenePreviewResponseSchema,
} from "@/schemas/entities/scenarios/handlers/create-scenario-scene-preview/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const createScenarioScenePreviewRoute = createHonoApp().basePath(
  "/scenarios/scenes/:sceneId",
);

// POST /api/v1/scenarios/scenes/{sceneId}/preview
createScenarioScenePreviewRoute.post(
  "/preview",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "create-scenario-scene-preview",
    windowMs: 60 * 1000,
    limit: 3,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario scene preview already exists",
        schema: createScenarioScenePreviewResponseSchema,
      }),
      [HTTPStatusCode.Created]: createOpenAPIResponse({
        description: "Scenario scene preview generation started",
        schema: createScenarioScenePreviewResponseSchema,
      }),
    },
  }),
  validator("param", createScenarioScenePreviewParamsSchema),
  async (c) => {
    const { sceneId } = c.req.valid("param");
    const user = c.get("user");

    const existingScene = await db.query.scenarioScene.findFirst({
      where: (scenarioScene, { eq }) => eq(scenarioScene.id, sceneId),
      with: {
        scenarioChapter: {
          with: {
            scenarioVersion: true,
          },
        },
        preview: {
          with: {
            attachment: true,
            compressedAttachment: true,
          },
        },
      },
    });

    if (!existingScene) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Сцена не найдена",
      });
    }

    const foundScenario = await db.query.scenario.findFirst({
      where: (scenario, { eq }) =>
        eq(
          scenario.id,
          existingScene.scenarioChapter.scenarioVersion.scenarioId,
        ),
      columns: { userId: true },
    });

    if (!foundScenario || foundScenario.userId !== user.id) {
      return throwAPIError({
        code: APIErrorCode.Forbidden,
        message: "У вас нет доступа к этой сцене",
      });
    }

    if (existingScene.preview) {
      const { attachment, compressedAttachment, ...preparedPreview } =
        existingScene.preview;

      const [url, urlCompressed] = await Promise.all([
        attachment ? getSignedS3Url(attachment.key) : null,
        compressedAttachment ? getSignedS3Url(compressedAttachment.key) : null,
      ]);

      return c.json<CreateScenarioScenePreviewResponse>(
        createScenarioScenePreviewResponseSchema.parse({
          data: {
            ...preparedPreview,
            url,
            urlCompressed,
          },
        }),
        HTTPStatusCode.Ok,
      );
    }

    const [createdPreview] = await db
      .insert(scenarioScenePreview)
      .values({ scenarioSceneId: sceneId })
      .returning();

    await enqueueScenarioScenePreviewGeneration({
      scenarioScenePreviewId: createdPreview.id,
    });

    return c.json<CreateScenarioScenePreviewResponse>(
      createScenarioScenePreviewResponseSchema.parse({
        data: {
          ...createdPreview,
          url: null,
          urlCompressed: null,
        },
      }),
      HTTPStatusCode.Created,
    );
  },
);
