import { describe, it, expect } from "vitest";
import { oauthReturnPath } from "../lib/oauth-return-path";

describe("OAuth return path", () => {
  it("preserves the complete consent request", () => {
    expect(oauthReturnPath("/.lovable/oauth/consent?authorization_id=abc#decision")).toBe("/.lovable/oauth/consent?authorization_id=abc#decision");
  });
  it("rejects external and ambiguous redirects", () => {
    for (const value of ["https://outside.invalid", "//outside.invalid", "/\\outside.invalid", "/\noutside.invalid", null]) expect(oauthReturnPath(value)).toBe("/");
  });
});