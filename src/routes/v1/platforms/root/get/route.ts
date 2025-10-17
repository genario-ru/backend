import { db } from "@/db";
import {
  type GetPlatformsResponse,
  getPlatformsResponseSchema,
} from "@/schemas/entities/platforms/handlers/get-platforms/response";
import { createHonoApp } from "@/utils/create-hono-app";

export const getPlatformsRoute = createHonoApp().basePath("/platforms");

// GET /api/v1/platforms
getPlatformsRoute.get("/", async (c) => {
  const foundPlatforms = await db.query.platform.findMany({
    with: {
      platformToVideoType: {
        with: { videoType: true },
      },
    },
  });

  const preparedPlatforms = foundPlatforms.map((platform) => ({
    ...platform,
    videoTypes: platform.platformToVideoType.map(({ videoType }) => videoType),
  }));

  return c.json<GetPlatformsResponse>(
    getPlatformsResponseSchema.parse({
      data: preparedPlatforms,
    }),
  );
});
