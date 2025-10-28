import { zValidator } from "@hono/zod-validator";

import { db } from "@/db";
import { profile, profileToPlatform, profileToTone } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { createProfileBodySchema } from "@/schemas/entities/profiles/handlers/create-profile/body";
import {
  type CreateProfileResponse,
  createProfileResponseSchema,
} from "@/schemas/entities/profiles/handlers/create-profile/response";
import { createHonoApp } from "@/utils/create-hono-app";

export const createProfileRoute = createHonoApp().basePath("/profiles");

// POST /api/v1/profiles
createProfileRoute.post(
  "/",
  sessionMiddleware,
  zValidator("json", createProfileBodySchema),
  async (c) => {
    const { platformIds, toneIds, ...createProfileParams } =
      c.req.valid("json");

    const user = c.get("user");

    const createdProfile = await db.transaction(async (tx) => {
      const [createdProfile] = await tx
        .insert(profile)
        .values({
          userId: user.id,
          ...createProfileParams,
        })
        .returning();

      const createLinkingTablePromises: Promise<any>[] = [];

      if (platformIds && platformIds.length > 0) {
        createLinkingTablePromises.push(
          tx.insert(profileToPlatform).values(
            platformIds.map((platformId) => ({
              profileId: createdProfile.id,
              platformId,
            })),
          ),
        );
      }

      if (toneIds && toneIds.length > 0) {
        createLinkingTablePromises.push(
          tx.insert(profileToTone).values(
            toneIds.map((toneId) => ({
              profileId: createdProfile.id,
              toneId,
            })),
          ),
        );
      }

      await Promise.all(createLinkingTablePromises);

      return createdProfile;
    });

    return c.json<CreateProfileResponse>(
      createProfileResponseSchema.parse({
        data: createdProfile,
      }),
    );
  },
);
