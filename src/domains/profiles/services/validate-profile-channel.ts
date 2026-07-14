import type { ProfileChannelUrlValidation } from "@/domains/profiles/schemas/entities/profile-channel-url-validation";
import { mapResolveProfileChannelResultToValidation } from "@/domains/profiles/utils/map-resolve-profile-channel-result-to-validation";

import { resolveProfileChannel } from "./resolve-profile-channel";

type ValidateProfileChannelParams = {
  url: string;
};

export async function validateProfileChannel({
  url,
}: ValidateProfileChannelParams): Promise<ProfileChannelUrlValidation> {
  const result = await resolveProfileChannel({ url });

  return mapResolveProfileChannelResultToValidation({ result });
}
