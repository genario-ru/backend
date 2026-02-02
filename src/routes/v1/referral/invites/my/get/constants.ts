import {
  DEFAULT_REFERRAL_INVITE_SORT,
  REFERRAL_INVITE_SORT_VALUES,
  type ReferralInviteSortField,
  type ReferralInviteSortOrder,
} from "@/schemas/entities/referral/entities/referral-invite-sort";

export const REFERRAL_INVITE_SORT_MAP: Record<
  string,
  {
    label: string;
    sortBy: ReferralInviteSortField;
    sortOrder: ReferralInviteSortOrder;
  }
> = {
  createdAtDesc: {
    label: "Дата создания (по убыванию)",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  createdAtAsc: {
    label: "Дата создания (по возрастанию)",
    sortBy: "createdAt",
    sortOrder: "asc",
  },
  updatedAtDesc: {
    label: "Дата изменения (по убыванию)",
    sortBy: "updatedAt",
    sortOrder: "desc",
  },
  updatedAtAsc: {
    label: "Дата изменения (по возрастанию)",
    sortBy: "updatedAt",
    sortOrder: "asc",
  },
};

export const DEFAULT_REFERRAL_INVITE_SORT_MAP =
  REFERRAL_INVITE_SORT_MAP[DEFAULT_REFERRAL_INVITE_SORT];

export const REFERRAL_INVITE_SORT_OPTIONS = REFERRAL_INVITE_SORT_VALUES.map(
  (value) => ({
    value,
    label: REFERRAL_INVITE_SORT_MAP[value].label,
  }),
);
