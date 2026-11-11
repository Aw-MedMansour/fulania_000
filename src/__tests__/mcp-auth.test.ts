import { expect, it } from "vitest";
import mcp from "../lib/mcp";

it("requires delegated OAuth on every existing MCP tool", () => {
  expect(mcp.auth).toMatchObject({ requireOAuthClientClaim: true });
  expect(mcp.tools).toHaveLength(9);
});