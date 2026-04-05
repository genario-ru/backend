import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { getScenarioCurrentVersionParamsSchema } from "@/schemas/entities/scenarios/handlers/get-scenario-current-version/params";
import {
  type GetScenarioCurrentVersionResponse,
  getScenarioCurrentVersionResponseSchema,
} from "@/schemas/entities/scenarios/handlers/get-scenario-current-version/response";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

export const getScenarioCurrentVersionRoute = createHonoApp().basePath(
  "/scenarios/:scenarioId/current-version",
);

// GET /api/v1/scenarios/{scenarioId}/current-version
getScenarioCurrentVersionRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-scenario-current-version",
    windowMs: 60 * 1000,
    limit: 20,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Scenario current version retrieved successfully",
        schema: getScenarioCurrentVersionResponseSchema,
      }),
    },
  }),
  validator("param", getScenarioCurrentVersionParamsSchema),
  async (c) => {
    const { scenarioId } = c.req.valid("param");
    const user = c.get("user");

    const scenario = await db.query.scenario.findFirst({
      where: (scenario, { eq, and }) =>
        and(eq(scenario.id, scenarioId), eq(scenario.userId, user.id)),
    });

    if (!scenario) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный сценарий не существует или у вас нет возможности просматривать его",
      });
    }

    const currentVersionId = scenario.currentVersionId;

    if (!currentVersionId) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Текущая версия сценария не найдена",
      });
    }

    const version = await db.query.scenarioVersion.findFirst({
      where: (scenarioVersion, { eq, and }) =>
        and(
          eq(scenarioVersion.id, currentVersionId),
          eq(scenarioVersion.scenarioId, scenarioId),
        ),
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

    const { scenarioToTone, ...scenarioData } = version.scenario;
    const { scenario: _scenario, ...versionData } = version;

    return c.json<GetScenarioCurrentVersionResponse>(
      getScenarioCurrentVersionResponseSchema.parse({
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
