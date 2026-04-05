import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { zodTextFormat } from "openai/helpers/zod";

import { generateProfileFromChannelsPrompt } from "@/ai/prompts/builders/generate-profile-from-channels";
import { systemPrompt } from "@/ai/prompts/builders/system-prompt";
import { polzaAI } from "@/ai/providers/open-ai/polza-ai";
import { envs } from "@/constants/shared/common/envs";
import { db } from "@/db";
import {
  profile,
  profileChannel,
  profileChannelToProfilesFromChannelsJob,
  profileChannelVideo,
  profilesFromChannelsJob,
  profileToPlatform,
  profileToProfilesFromChannelsJob,
  profileToTone,
} from "@/db/schema";
import { profileGeneratedSchema } from "@/domains/profiles/schemas/entities/profile-generated";
import { redis } from "@/lib/redis";

import {
  PROFILES_FROM_CHANNELS_GENERATION_QUEUE_NAME,
  type ProfilesFromChannelsGenerationJobData,
} from "./queue";
import { fetchChannelData, groupChannelsByCreator } from "./utils";

export const profilesFromChannelsGenerationWorker =
  new Worker<ProfilesFromChannelsGenerationJobData>(
    PROFILES_FROM_CHANNELS_GENERATION_QUEUE_NAME,
    async (job) => {
      const { jobId, userId, channels } = job.data;

      console.log("Profiles from channels generation worker started", job.data);

      try {
        await db
          .update(profilesFromChannelsJob)
          .set({ status: "generation" })
          .where(eq(profilesFromChannelsJob.id, jobId));

        const fetchResults = await Promise.all(
          channels.map((channel) => fetchChannelData(channel)),
        );

        const fetchedChannels = fetchResults.filter(
          (channel) => channel !== null,
        );

        if (fetchedChannels.length === 0) {
          await db
            .update(profilesFromChannelsJob)
            .set({
              status: "failed",
              statusDetails: "Не удалось получить данные ни одного канала",
            })
            .where(eq(profilesFromChannelsJob.id, jobId));

          return;
        }

        const availableTones = await db.query.tone.findMany();
        const groups = await groupChannelsByCreator(fetchedChannels);

        for (const group of groups) {
          const groupChannels = group.map((i) => fetchedChannels[i]);

          const prompt = generateProfileFromChannelsPrompt({
            channels: groupChannels.map((channel) => channel.data),
            availableTones: availableTones.map((tone) => ({
              id: tone.id,
              name: tone.name,
              description: tone.description ?? undefined,
            })),
          });

          const { output_parsed: generatedProfile } =
            await polzaAI.responses.parse({
              model: envs.POLZA_AI_STRUCTURED_OUTPUT_MODEL,
              temperature: 0.5,
              input: [
                { role: "system", content: systemPrompt() },
                { role: "user", content: prompt },
              ],
              text: {
                format: zodTextFormat(profileGeneratedSchema, "profile"),
              },
            });

          if (!generatedProfile) {
            console.error("Profile generation failed", groupChannels);

            continue;
          }

          const validToneIds = generatedProfile.toneIds.filter((id) =>
            availableTones.some((t) => t.id === id),
          );

          const platformsIdsSet = new Set(
            groupChannels.map((channel) => channel.input.platformId),
          );

          const uniquePlatformIds = Array.from(platformsIdsSet);

          await db.transaction(async (tx) => {
            const [createdProfile] = await tx
              .insert(profile)
              .values({
                userId,
                name: generatedProfile.name,
                description: generatedProfile.description,
                targetAudience: generatedProfile.targetAudience,
              })
              .returning();

            const insertPromises: Promise<unknown>[] = [
              tx.insert(profileToProfilesFromChannelsJob).values({
                profileId: createdProfile.id,
                profilesFromChannelsJobId: jobId,
              }),
            ];

            if (validToneIds.length > 0) {
              insertPromises.push(
                tx.insert(profileToTone).values(
                  validToneIds.map((toneId) => ({
                    profileId: createdProfile.id,
                    toneId,
                  })),
                ),
              );
            }

            if (uniquePlatformIds.length > 0) {
              insertPromises.push(
                tx.insert(profileToPlatform).values(
                  uniquePlatformIds.map((platformId) => ({
                    profileId: createdProfile.id,
                    platformId,
                  })),
                ),
              );
            }

            await Promise.all(insertPromises);

            for (const channel of groupChannels) {
              const [createdChannel] = await tx
                .insert(profileChannel)
                .values({
                  profileId: createdProfile.id,
                  internalId: channel.internalId,
                  slug: channel.slug,
                  url: channel.input.url,
                  avatarUrl: channel.avatarUrl,
                  name: channel.name,
                  description: channel.description,
                  platformId: channel.input.platformId,
                })
                .returning();

              await tx.insert(profileChannelToProfilesFromChannelsJob).values({
                profileChannelId: createdChannel.id,
                profilesFromChannelsJobId: jobId,
              });

              if (channel.videos.length > 0) {
                await tx.insert(profileChannelVideo).values(
                  channel.videos.map((video) => ({
                    profileChannelId: createdChannel.id,
                    internalId: video.internalId,
                    url: video.url,
                    thumbnailUrl: video.thumbnailUrl,
                    name: video.name,
                    description: video.description,
                  })),
                );
              }
            }
          });
        }

        await db
          .update(profilesFromChannelsJob)
          .set({ status: "ready" })
          .where(eq(profilesFromChannelsJob.id, jobId));

        console.log("Profiles from channels generation finished");
      } catch (error) {
        console.error("Profiles from channels generation worker error", error);

        const statusDetails =
          error instanceof Error ? error.message : "Unknown error";

        try {
          await db
            .update(profilesFromChannelsJob)
            .set({
              status: "failed",
              statusDetails,
            })
            .where(eq(profilesFromChannelsJob.id, jobId));
        } catch (updateError) {
          console.error(
            "Profiles from channels worker failed to update status",
            updateError,
          );
        }

        throw error;
      }
    },
    {
      concurrency: 5,
      connection: redis,
    },
  );

profilesFromChannelsGenerationWorker.on("error", (error) => {
  console.error("Profiles from channels generation worker error", error);
});

profilesFromChannelsGenerationWorker.on("failed", (job, error) => {
  console.error(
    "Profiles from channels generation worker failed",
    job?.toJSON(),
    error,
  );
});

profilesFromChannelsGenerationWorker.on("completed", (job) => {
  console.log("Profiles from channels generation worker completed", job.id);
});
