import { z } from "@/lib/zod";

export const onboardingItemTypeSchema = z.enum([
  "profile",
  "ideas-list",
  "scenario",
  "metadata",
]);

export const onboardingItemStatusSchema = z.enum([
  "pending",
  "completed",
  "locked",
]);

export const onboardingItemSchema = z.object({
  type: onboardingItemTypeSchema,
  status: onboardingItemStatusSchema,
  title: z.string(),
  description: z.string(),
});

export const getOnboardingResponseSchema = z
  .object({
    icon: z.string(),
    title: z.string(),
    description: z.string(),
    items: z.array(onboardingItemSchema),
  })
  .meta({
    title: "Get onboarding response",
    description: "Get onboarding response description",
    ref: "GetOnboardingResponseSchema",
  });

export type OnboardingItemType = z.infer<typeof onboardingItemTypeSchema>;

export type OnboardingItemStatus = z.infer<typeof onboardingItemStatusSchema>;

export type OnboardingItem = z.infer<typeof onboardingItemSchema>;

export type GetOnboardingResponse = z.infer<typeof getOnboardingResponseSchema>;
