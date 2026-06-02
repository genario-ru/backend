import * as ipaddr from "ipaddr.js";

type ParsedIpAllowlistCidrEntry = {
  type: "cidr";
  range: ReturnType<typeof ipaddr.parseCIDR>;
};

type ParsedIpAllowlistIpEntry = {
  type: "ip";
  ip: ipaddr.IPv4 | ipaddr.IPv6;
};

type ParsedIpAllowlistEntry =
  | ParsedIpAllowlistCidrEntry
  | ParsedIpAllowlistIpEntry;

export function parseIpAllowlist(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function isValidIpAllowlist(value: string | undefined) {
  try {
    parseIpAllowlist(value).forEach(parseIpAllowlistEntry);
    return true;
  } catch {
    return false;
  }
}

export function createIpAllowlistMatcher(entries: string[]) {
  const parsedEntries = entries.map(parseIpAllowlistEntry);

  return (ip: string) => {
    let parsedIp: ipaddr.IPv4 | ipaddr.IPv6;

    try {
      parsedIp = ipaddr.process(ip);
    } catch {
      return false;
    }

    return parsedEntries.some((entry) => {
      if (entry.type === "ip") {
        return (
          parsedIp.kind() === entry.ip.kind() &&
          parsedIp.toString() === entry.ip.toString()
        );
      }

      const [rangeIp, prefixLength] = entry.range;

      return (
        parsedIp.kind() === rangeIp.kind() &&
        parsedIp.match(rangeIp, prefixLength)
      );
    });
  };
}

function parseIpAllowlistEntry(entry: string): ParsedIpAllowlistEntry {
  if (entry.includes("/")) {
    return {
      type: "cidr",
      range: ipaddr.parseCIDR(entry),
    };
  }

  return {
    type: "ip",
    ip: ipaddr.process(entry),
  };
}
