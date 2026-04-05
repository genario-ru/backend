import { validator } from "hono-openapi";

import { db } from "@/db";
import { getScenarioVersionParamsSchema } from "@/domains/scenarios/schemas/handlers/get-scenario-version/params";
import {
  type GetScenarioVersionResponse,
  getScenarioVersionResponseSchema,
} from "@/domains/scenarios/schemas/handlers/get-scenario-version/response";
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

export const getScenarioVersionRoute = createHonoApp().basePath(
  "/scenarios/versions/:versionId",
);

// GET /api/v1/scenarios/versions/{versionId}
getScenarioVersionRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-scenario-version",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario version retrieved successfully",
        schema: getScenarioVersionResponseSchema,
      }),
    },
  }),
  validator("param", getScenarioVersionParamsSchema),
  async (c) => {
    const { versionId } = c.req.valid("param");
    const user = c.get("user");

    // Получаем версию с разделами и проверяем владельца через JOIN
    const version = await db.query.scenarioVersion.findFirst({
      where: (scenarioVersion, { eq }) => eq(scenarioVersion.id, versionId),
      with: {
        scenario: {
          with: {
            profile: true,
            platform: true,
            videoType: true,
            videoDuration: true,
            scenarioToTone: {
              with: { tone: true },
            },
          },
        },
        chapters: {
          orderBy: (scenarioChapter, { asc }) => [
            asc(scenarioChapter.startTime),
          ],
        },
      },
    });

    if (!version) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Версия сценария не найдена",
      });
    }

    // Проверяем, что сценарий принадлежит пользователю
    if (version.scenario.userId !== user.id) {
      return throwAPIError({
        code: APIErrorCode.Forbidden,
        message:
          "Данный сценарий не существует или у вас нет возможности просматривать его",
      });
    }

    const { scenarioToTone, ...scenarioData } = version.scenario;
    const { scenario: _scenario, ...versionData } = version;

    return c.json<GetScenarioVersionResponse>(
      getScenarioVersionResponseSchema.parse({
        data: {
          ...versionData,
          profile: scenarioData.profile,
          platform: scenarioData.platform,
          videoType: scenarioData.videoType,
          videoDuration: scenarioData.videoDuration,
          tones: scenarioToTone.map((item) => item.tone),
          scenarioChapters: versionData.chapters,
        },
      }),
    );
  },
);
