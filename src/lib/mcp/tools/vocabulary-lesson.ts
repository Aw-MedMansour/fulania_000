import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { callAI, textResult, errorResult } from "../ai";

export default defineTool({
  name: "vocabulary_lesson",
  title: "Pulaar vocabulary lesson",
  description:
    "Generate a themed vocabulary list (family, market, travel, food, religion, etc.) with Pulaar + translations and example sentences.",
  inputSchema: {
    theme: z.string().min(2).max(120).describe("Topic of the lesson."),
    count: z.number().int().min(3).max(20).default(8).describe("Number of words."),
    level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
    language: z.enum(["french", "english", "arabic"]).default("french"),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: async ({ theme, count, level, language }) => {
    try {
      const out = await callAI([
        {
          role: "system",
          content: `You are FulanIA. Produce a ${level} Pulaar vocabulary lesson in ${language} on the theme "${theme}". Return a Markdown table with columns: Pulaar | ${language} | Example (Pulaar → ${language}). Exactly ${count} rows. Use ɓ ɗ ƴ ŋ correctly.`,
        },
        { role: "user", content: `Theme: ${theme}` },
      ]);
      return textResult(out);
    } catch (e) {
      return errorResult(e instanceof Error ? e.message : "Failed");
    }
  },
});
