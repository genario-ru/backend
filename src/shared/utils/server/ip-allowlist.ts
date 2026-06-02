import { inRange, isIP, isRange } from "range_check";

const IPV4_MAPPED_IPV6_PREFIX = "::ffff:";

export function parseIpAllowlist(value: string | undefined) {
  const rawValue = value?.trim();

  if (!rawValue) {
    return [];
  }

  const unquotedValue = stripWrappingQuotes(rawValue, {
    preserveQuotedEntries: true,
  });

  if (!unquotedValue) {
    return [];
  }

  return unquotedValue.split(",").map(normalizeAllowlistEntry).filter(Boolean);
}

export function isValidIpAllowlist(value: string | undefined) {
  const entries = parseIpAllowlist(value);

  return entries.every(isValidIpAllowlistEntry);
}

export function createIpAllowlistMatcher(entries: string[]) {
  const normalizedAllowlist = normalizeAllowlistEntries(entries);

  return (ip: string) => {
    const normalizedIp = normalizeIpAddress(ip);
    const isValidClientIp = isIP(normalizedIp);

    if (!isValidClientIp) {
      return false;
    }

    return normalizedAllowlist.some((entry) => inRange(normalizedIp, entry));
  };
}

function normalizeAllowlistEntries(entries: string[]) {
  return entries.map((entry) => {
    const normalizedEntry = normalizeAllowlistEntry(entry);

    if (!isValidIpAllowlistEntry(normalizedEntry)) {
      throw new Error(`Invalid IP allowlist entry: ${entry}`);
    }

    return normalizedEntry;
  });
}

function normalizeAllowlistEntry(entry: string) {
  const unquotedEntry = stripWrappingQuotes(entry.trim());

  return normalizeIpAddress(unquotedEntry);
}

function isValidIpAllowlistEntry(entry: string) {
  if (entry.includes("/")) {
    return isRange(entry);
  }

  return isIP(entry);
}

function normalizeIpAddress(ip: string) {
  const normalizedIp = ip.trim();

  // Node/proxy окружение может отдавать IPv4 как IPv4-mapped IPv6.
  // range_check такой формат не принимает, поэтому приводим его к обычному IPv4.
  if (normalizedIp.toLowerCase().startsWith(IPV4_MAPPED_IPV6_PREFIX)) {
    return normalizedIp.slice(IPV4_MAPPED_IPV6_PREFIX.length);
  }

  return normalizedIp;
}

function stripWrappingQuotes(
  value: string,
  { preserveQuotedEntries = false }: { preserveQuotedEntries?: boolean } = {},
) {
  const firstCharacter = value[0];
  const lastCharacter = value.at(-1);
  const isWrappedInMatchingQuotes =
    value.length >= 2 &&
    (firstCharacter === '"' || firstCharacter === "'") &&
    firstCharacter === lastCharacter;

  if (!isWrappedInMatchingQuotes) {
    return value;
  }

  // В Dokploy кавычки могут сохраниться как часть значения env-переменной.
  // Для формата `"ip1","ip2"` нельзя снимать внешние кавычки со всей строки.
  const looksLikeQuotedEntries =
    preserveQuotedEntries &&
    value.includes(`${firstCharacter},${firstCharacter}`);

  if (looksLikeQuotedEntries) {
    return value;
  }

  return value.slice(1, -1).trim();
}
