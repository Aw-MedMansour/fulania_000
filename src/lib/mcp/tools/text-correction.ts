import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { callAI, textResult, errorResult } from "../ai";

export default defineTool({
  name: "text_correction",
  title: "Correct Pulaar text",
  description:
    "Correct spelling, grammar, orthography (ɓ ɗ ƴ ŋ), and word choice in a short Pulaar text. Returns the corrected version plus a brief explanation.",
  inputSchema: {
    text: z.string().min(1).max(1500).describe("Pulaar text to correct."),
    dialect: z
      .enum(["fouta_toro", "fouta_djallon", "macina", "adamawa"])
      .default("fouta_toro"),
    explanation_language: z.enum(["french", "english", "arabic"]).default("french"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ text, dialect, explanation_language }) => {
    try {
      const out = await callAI([
        {
          role: "system",
          content: `You are FulanIA, a Pulaar (Fulfulde) editor for the ${dialect} dialect. Return Markdown with two sections:
### Corrected
The corrected Pulaar text.
### Explanation
Bullet points in ${explanation_language} explaining each change (kept short).`,
        },
        { role: "user", content: text },
      ]);
      return textResult(out);
    } catch (e) {
      return errorResult(e instanceof Error ? e.message : "Failed");
    }
  },
});
