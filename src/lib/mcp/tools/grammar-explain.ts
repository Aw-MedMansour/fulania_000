import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { callAI, textResult, errorResult } from "../ai";

export default defineTool({
  name: "grammar_explain",
  title: "Pulaar grammar explanation",
  description:
    "Explain a Pulaar grammar topic — noun classes (ɗo/ngo/ndi/ɗi…), tenses, negation, pronouns, plurals, etc. — with 1–2 mini examples.",
  inputSchema: {
    topic: z.string().min(2).max(300).describe("Grammar topic or question."),
    language: z.enum(["french", "english", "arabic"]).default("french"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ topic, language }) => {
    try {
      const out = await callAI([
        {
          role: "system",
          content: `You are FulanIA, a Pulaar (Fulfulde) grammar teacher. Explain the topic in ${language}, clearly and briefly (max ~200 words). Bold every Pulaar form. Give 1–2 short examples with translation. Use ɓ ɗ ƴ ŋ correctly.`,
        },
        { role: "user", content: topic },
      ]);
      return textResult(out);
    } catch (e) {
      return errorResult(e instanceof Error ? e.message : "Failed");
    }
  },
});
