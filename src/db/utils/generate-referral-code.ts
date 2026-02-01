import { customAlphabet } from "nanoid";

const REFERRAL_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ2346789";
export const REFERRAL_CODE_LENGTH = 8;

export const generateReferralCode = customAlphabet(
  REFERRAL_CODE_ALPHABET,
  REFERRAL_CODE_LENGTH,
);
