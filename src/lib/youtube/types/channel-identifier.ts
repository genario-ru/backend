export type ChannelIdentifier =
  | { kind: "handle"; handle: string }
  | { kind: "channelId"; channelId: string }
  | { kind: "legacyUsername"; username: string };
