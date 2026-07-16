import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { callAI, textResult, errorResult } from "../ai";

export default defineTool({
  name: "chat_with_janngude",
  title: "Chat with Janngude (FulanIA assistant)",
  description:
    "Ask FulanIA's Pulaar tutor 'Janngude' anything about the Pulaar language, Fulɓe culture, or learning tips. Stateless — pass prior turns in `history` for context.",
  inputSchema: {
    message: z.string().min(1).max(2000).describe("Your message to the assistant."),
    history: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().max(2000),
        }),
      )
      .max(20)
      .default([])
      .describe("Prior conversation turns (optional)."),
    language: z.enum(["french", "english", "arabic", "pulaar"]).default("french"),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ message, history, language }) => {
    try {
      const out = await callAI([
        {
          role: "system",
          content: `You are Janngude, FulanIA's warm and passionate Pulaar (Fulfulde/Pular) tutor. Reply in ${language}, 1–5 sentences. Bold every Pulaar word/phrase. Use ɓ ɗ ƴ ŋ. Give one concrete example when useful. Never invent a Pulaar word — if unsure, say so.`,
        },
        ...history,
        { role: "user", content: message },
      ]);
      return textResult(out);
    } catch (e) {
      return errorResult(e instanceof Error ? e.message : "Failed");
    }
  },
});
