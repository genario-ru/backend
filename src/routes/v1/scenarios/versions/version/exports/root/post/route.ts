import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { scenarioVersionExport } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { enqueueScenarioVersionExport } from "@/mq/scenario/scenario-version-export/queue";
import { APIErrorCode } from "@/schemas/common/api-error";
import { createScenarioVersionExportBodySchema } from "@/schemas/entities/scenarios/handlers/create-scenario-version-export/body";
import { createScenarioVersionExportParamsSchema } from "@/schemas/entities/scenarios/handlers/create-scenario-version-export/params";
import {
  type CreateScenarioVersionExportResponse,
  createScenarioVersionExportResponseSchema,
} from "@/schemas/entities/scenarios/handlers/create-scenario-version-export/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const createScenarioVersionExportRoute = createHonoApp().basePath(
  "/scenarios/versions/:versionId/exports",
);

// POST /api/v1/scenarios/versions/{versionId}/exports
createScenarioVersionExportRoute.post(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Scenarios],
    responses: {
      [HTTPStatusCode.Created]: createOpenAPIResponse({
        description: "Scenario version export created successfully",
        schema: createScenarioVersionExportResponseSchema,
      }),
    },
  }),
  validator("param", createScenarioVersionExportParamsSchema),
  validator("json", createScenarioVersionExportBodySchema),
  async (c) => {
    const { versionId } = c.req.valid("param");
    const { format } = c.req.valid("json");
    const user = c.get("user");

    const foundVersion = await db.query.scenarioVersion.findFirst({
      where: (scenarioVersion, { eq }) => eq(scenarioVersion.id, versionId),
      with: {
        scenario: {
          columns: {
            userId: true,
          },
        },
      },
    });

    if (!foundVersion) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Версия сценария не найдена",
      });
    }

    if (foundVersion.scenario.userId !== user.id) {
      return throwAPIError({
        code: APIErrorCode.Forbidden,
        message:
          "Данный сценарий не существует или у вас нет возможности экспортировать его",
      });
    }

    const [createdExportJob] = await db
      .insert(scenarioVersionExport)
      .values({
        userId: user.id,
        scenarioVersionId: versionId,
        format,
      })
      .returning();

    await enqueueScenarioVersionExport({
      scenarioVersionExportId: createdExportJob.id,
    });

    return c.json<CreateScenarioVersionExportResponse>(
      createScenarioVersionExportResponseSchema.parse({
        data: {
          ...createdExportJob,
          url: null,
        },
      }),
      HTTPStatusCode.Created,
    );
  },
);
