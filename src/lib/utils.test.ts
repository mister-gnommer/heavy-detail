import { describe, it, expect } from "vitest";
import { cn, parseDecimal } from "./utils";

describe("cn", () => {
  it("merges class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("resolves Tailwind conflicts: later class wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles conditional objects", () => {
    expect(cn({ hidden: false, block: true })).toBe("block");
  });

  it("handles undefined and null without throwing", () => {
    expect(cn(undefined, null, "foo")).toBe("foo");
  });

  it("returns empty string when called with no arguments", () => {
    expect(cn()).toBe("");
  });
});

describe("parseDecimal", () => {
  it("parses dot decimal separator", () => {
    expect(parseDecimal("82.5")).toBe(82.5);
  });

  it("parses comma decimal separator", () => {
    expect(parseDecimal("82,5")).toBe(82.5);
  });

  it("parses integer weight", () => {
    expect(parseDecimal("80")).toBe(80);
  });

  it("parses weight with leading/trailing whitespace", () => {
    expect(parseDecimal(" 82.5 ")).toBe(82.5);
  });
});
