import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import {
  type GetVideoTypesResponse,
  getVideoTypesResponseSchema,
} from "@/schemas/entities/video-types/handlers/get-video-types/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const getVideoTypesRoute = createHonoApp().basePath("/video-types");

// GET /api/v1/video-types
getVideoTypesRoute.get(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.VideoTypes],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Video types retrieved successfully",
        schema: getVideoTypesResponseSchema,
      }),
    },
  }),
  async (c) => {
    const foundVideoTypes = await db.query.videoType.findMany();

    return c.json<GetVideoTypesResponse>(
      getVideoTypesResponseSchema.parse({
        data: foundVideoTypes,
      }),
    );
  },
);
