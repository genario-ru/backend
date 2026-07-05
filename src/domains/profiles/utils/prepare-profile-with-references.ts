import type { GetProfileData } from "../schemas/handlers/get-profile/response";
import type { ProfileExtendedWithReferencesRecord } from "../types/profile-response";
import { prepareProfileExtended } from "./prepare-profile-extended";
import { prepareProfileReferences } from "./prepare-profile-references";

export function prepareProfileWithReferences(
  profileRecord: ProfileExtendedWithReferencesRecord,
): GetProfileData {
  const { attachments, ...profileExtendedRecord } = profileRecord;

  return {
    ...prepareProfileExtended(profileExtendedRecord),
    references: prepareProfileReferences(attachments),
  };
}
