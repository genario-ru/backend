import { db } from "@/db";
import { createHonoApp } from "@/utils/create-hono-app";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { getMyScenariosResponseSchema, type GetMyScenariosResponse } from "@/schemas/entities/scenarios/handlers/get-my-scenarios/response";

export const getMyScenariosRoute = createHonoApp().basePath("/scenarios/my");

// GET /api/v1/scenarios/my
getMyScenariosRoute.get("/", sessionMiddleware, async (c) => {
  const user = c.get("user");

  const foundScenarios = await db.query.scenario.findMany({
    where: (profile, { eq }) => eq(profile.userId, user.id),
    with: {
      profile: true,
      platform: true,
      videoType: true,
      videoDuration: true,
      scenarioToTone: {
        with: { tone: true },
      },
    },
  });

  return c.json<GetMyScenariosResponse>(
    getMyScenariosResponseSchema.parse({
      data: foundScenarios.map((scenario) => ({
        ...scenario,
        tones: scenario.scenarioToTone.map(({ tone }) => tone),
      })),
    }),
  );
});
