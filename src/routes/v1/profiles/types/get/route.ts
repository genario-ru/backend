import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import {
  type GetProfileTypesResponse,
  getProfileTypesResponseSchema,
} from "@/schemas/entities/profiles/handlers/get-profile-types/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const getProfileTypesRoute = createHonoApp().basePath("/profiles/types");

// GET /api/v1/profiles/types
getProfileTypesRoute.get(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Profiles],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Profile types retrieved successfully",
        schema: getProfileTypesResponseSchema,
      }),
    },
  }),
  async (c) => {
    const foundProfileTypes = await db.query.profileType.findMany();

    return c.json<GetProfileTypesResponse>(
      getProfileTypesResponseSchema.parse({
        data: foundProfileTypes,
      }),
    );
  },
);
