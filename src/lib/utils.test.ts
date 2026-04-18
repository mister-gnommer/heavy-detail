import { describe, it, expect } from "vitest";
import { cn } from "./utils";

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
