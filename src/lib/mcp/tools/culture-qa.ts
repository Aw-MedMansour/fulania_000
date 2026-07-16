import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { callAI, textResult, errorResult } from "../ai";

export default defineTool({
  name: "culture_qa",
  title: "Fulani culture Q&A",
  description:
    "Answer questions about Fulani (Fulɓe) history, traditions, pulaaku code of conduct, transhumance, oral literature, music, cuisine, and diaspora.",
  inputSchema: {
    question: z.string().min(3).max(1000).describe("The question about Fulani culture."),
    language: z
      .enum(["french", "english", "arabic", "pulaar"])
      .default("french")
      .describe("Language of the answer."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ question, language }) => {
    try {
      const out = await callAI([
        {
          role: "system",
          content: `You are FulanIA, a knowledgeable and respectful guide to Fulɓe (Fulani/Peul) civilization. Answer accurately in ${language}. Cite region or era when helpful. If unsure, say so. Keep it concise (3-8 sentences) unless the user asks for depth.`,
        },
        { role: "user", content: question },
      ]);
      return textResult(out);
    } catch (e) {
      return errorResult(e instanceof Error ? e.message : "Failed to answer");
    }
  },
});
