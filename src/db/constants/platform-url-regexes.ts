export const platformChannelUrlRegexes = {
  youTube:
    "^https?:\\/\\/(?:www\\.|m\\.)?youtube\\.com\\/(?:@[A-Za-z0-9._-]+|channel\\/[A-Za-z0-9_-]{24}|c\\/[A-Za-z0-9._-]+|user\\/[A-Za-z0-9._-]+)\\/?$",
  ruTube: "^https?:\\/\\/(?:www\\.)?rutube\\.ru\\/channel\\/\\d+\\/?$",
  vkVideo: "^https?:\\/\\/(?:www\\.)?vkvideo\\.ru\\/@[A-Za-z0-9._-]+\\/?$",
};

export const platformUrlRegexes = {
  youTube: "^https?:\\/\\/(?:www\\.|m\\.)?youtube\\.com\\/",
  ruTube: "^https?:\\/\\/(?:www\\.)?rutube\\.ru\\/",
  vkVideo: "^https?:\\/\\/(?:www\\.)?vkvideo\\.ru\\/",
};
