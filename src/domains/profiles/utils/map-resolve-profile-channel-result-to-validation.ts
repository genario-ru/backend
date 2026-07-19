import type { ProfileChannelUrlValidation } from "@/domains/profiles/schemas/entities/profile-channel-url-validation";
import type { ResolveProfileChannelResult } from "@/domains/profiles/types/resolve-profile-channel";

type MapResolveProfileChannelResultToValidationParams = {
  result: ResolveProfileChannelResult;
};

export function mapResolveProfileChannelResultToValidation({
  result,
}: MapResolveProfileChannelResultToValidationParams): ProfileChannelUrlValidation {
  if (result.status === "error") {
    return {
      url: result.url,
      status: "error",
      statusDetails: result.statusDetails,
      platform: null,
    };
  }

  return {
    url: result.data.url,
    status: "success",
    statusDetails: "Канал найден",
    platform: result.data.platform,
  };
}
