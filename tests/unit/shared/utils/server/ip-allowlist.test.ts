import { describe, expect, it } from "vitest";

import {
  createIpAllowlistMatcher,
  isValidIpAllowlist,
  parseIpAllowlist,
} from "@/shared/utils/server/ip-allowlist";

const yookassaIpAllowlist = [
  "185.71.76.0/27",
  "185.71.77.0/27",
  "77.75.153.0/25",
  "77.75.156.11",
  "77.75.156.35",
  "77.75.154.128/25",
  "2a02:5180::/32",
];

describe("ip allowlist", () => {
  it("matches YooKassa IPv4 CIDR, exact IPv4, and IPv6 CIDR entries", () => {
    const isAllowed = createIpAllowlistMatcher(yookassaIpAllowlist);

    expect(isAllowed("185.71.76.0")).toBe(true);
    expect(isAllowed("185.71.76.31")).toBe(true);
    expect(isAllowed("185.71.76.32")).toBe(false);
    expect(isAllowed("77.75.153.127")).toBe(true);
    expect(isAllowed("77.75.153.128")).toBe(false);
    expect(isAllowed("77.75.156.11")).toBe(true);
    expect(isAllowed("77.75.156.12")).toBe(false);
    expect(isAllowed("2a02:5180::1")).toBe(true);
    expect(isAllowed("2a02:5181::1")).toBe(false);
  });

  it("normalizes IPv4-mapped IPv6 client addresses", () => {
    const isAllowed = createIpAllowlistMatcher(["77.75.156.11"]);

    expect(isAllowed("::ffff:77.75.156.11")).toBe(true);
  });

  it("validates comma-separated IP and CIDR allowlists", () => {
    const rawValue = yookassaIpAllowlist.join(", ");

    expect(parseIpAllowlist(rawValue)).toEqual(yookassaIpAllowlist);
    expect(isValidIpAllowlist(rawValue)).toBe(true);
    expect(isValidIpAllowlist("77.75.156.11/33")).toBe(false);
    expect(isValidIpAllowlist("not-an-ip")).toBe(false);
  });

  it("accepts quote-wrapped environment values from deployment UIs", () => {
    expect(parseIpAllowlist('"72.56.11.219"')).toEqual(["72.56.11.219"]);
    expect(parseIpAllowlist('"188.116.21.130,77.236.68.153"')).toEqual([
      "188.116.21.130",
      "77.236.68.153",
    ]);
    expect(parseIpAllowlist('"188.116.21.130","77.236.68.153"')).toEqual([
      "188.116.21.130",
      "77.236.68.153",
    ]);
    expect(isValidIpAllowlist('"188.116.21.130,77.236.68.153"')).toBe(true);
  });
});
