import { z } from "@/lib/zod";

export const profileReferenceItemSchema = z
  .object({
    id: z.uuid(),
    mimeType: z.string(),
    fileName: z.string(),
    downloadUrl: z.string(),
    createdAt: z.string(),
  })
  .meta({
    title: "Profile reference item",
    description: "Profile reference item description",
    ref: "ProfileReferenceItemSchema",
  });

export type ProfileReferenceItem = z.infer<typeof profileReferenceItemSchema>;

export const profileReferencesSchema = z
  .object({
    videoReferences: z.array(profileReferenceItemSchema),
    thumbnailReferences: z.array(profileReferenceItemSchema),
    actorReferences: z.array(profileReferenceItemSchema),
  })
  .meta({
    title: "Profile references",
    description: "Profile references description",
    ref: "ProfileReferencesSchema",
  });

export type ProfileReferences = z.infer<typeof profileReferencesSchema>;
