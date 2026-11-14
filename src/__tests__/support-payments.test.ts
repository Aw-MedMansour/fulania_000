import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "src/routes/support.tsx"), "utf8");
const methods = [...source.matchAll(/key: "([^"]+)", label: "([^"]+)", value: "([^"]+)"/g)]
  .map((match) => ({ key: match[1], services: match[2].split(" & "), value: match[3] }));

it("Bankily reçoit les dons au 42 81 51 62", () => {
  expect(methods.find((method) => method.services.includes("Bankily"))?.value).toBe("42815162");
});

it("Sedad reçoit les dons au 42 81 51 62", () => {
  expect(methods.find((method) => method.services.includes("Sedad"))?.value).toBe("42815162");
});

it("Masrivi reçoit les dons au 48 52 49 83", () => {
  expect(methods.find((method) => method.services.includes("Masrivi"))?.value).toBe("48524983");
});