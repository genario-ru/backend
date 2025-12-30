import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import {
  type GetPlansResponse,
  getPlansResponseSchema,
} from "@/schemas/entities/plans/handlers/get-plans/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const getPlansRoute = createHonoApp().basePath("/plans");

// GET /api/v1/plans
getPlansRoute.get(
  "/",
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Plans],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Plans retrieved successfully",
        schema: getPlansResponseSchema,
      }),
    },
  }),
  async (c) => {
    const foundPlans = await db.query.plan.findMany();

    return c.json<GetPlansResponse>(
      getPlansResponseSchema.parse({
        data: foundPlans,
      }),
    );
  },
);
