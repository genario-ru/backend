import * as z from "zod";

export const REFERRAL_INVITE_SORT_VALUES = [
  "createdAtDesc",
  "createdAtAsc",
  "updatedAtDesc",
  "updatedAtAsc",
] as const;

export const referralInviteSortSchema = z.enum(REFERRAL_INVITE_SORT_VALUES);

export type ReferralInviteSort = (typeof REFERRAL_INVITE_SORT_VALUES)[number];

export type ReferralInviteSortField = "createdAt" | "updatedAt";
export type ReferralInviteSortOrder = "asc" | "desc";

export const DEFAULT_REFERRAL_INVITE_SORT: ReferralInviteSort = "createdAtDesc";
