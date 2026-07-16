import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { callAI, textResult, errorResult } from "../ai";

export default defineTool({
  name: "generate_exercise",
  title: "Generate a Pulaar exercise or quiz",
  description:
    "Create a self-contained Pulaar learning exercise (fill-in-the-blank, multiple-choice, translation, or matching) with an answer key.",
  inputSchema: {
    theme: z.string().min(2).max(120).describe("Topic or grammar point."),
    type: z
      .enum(["fill_blank", "multiple_choice", "translation", "matching"])
      .default("multiple_choice"),
    count: z.number().int().min(1).max(10).default(5),
    level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
    language: z.enum(["french", "english", "arabic"]).default("french"),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: async ({ theme, type, count, level, language }) => {
    try {
      const out = await callAI([
        {
          role: "system",
          content: `You are FulanIA, a Pulaar (Fulfulde) tutor. Create a ${level} ${type.replace("_", " ")} exercise with ${count} items on "${theme}". Instructions and options in ${language}; Pulaar answers in bold with ɓ ɗ ƴ ŋ. End with an "**Answers**" section. Format as clean Markdown.`,
        },
        { role: "user", content: `Theme: ${theme}` },
      ]);
      return textResult(out);
    } catch (e) {
      return errorResult(e instanceof Error ? e.message : "Failed");
    }
  },
});
