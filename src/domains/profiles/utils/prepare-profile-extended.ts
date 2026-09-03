import type { ProfileExtended } from "../schemas/entities/profile";
import type { ProfileExtendedRecord } from "../types/profile-response";

export function prepareProfileExtended(
  profileRecord: ProfileExtendedRecord,
): ProfileExtended {
  const { profileToPlatform, ...baseProfile } = profileRecord;

  return {
    ...baseProfile,
    platforms: profileToPlatform.map(({ platform }) => platform),
  };
}
