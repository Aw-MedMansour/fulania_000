import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { callAI, textResult, errorResult } from "../ai";

const LANGS = ["pulaar", "french", "english", "arabic"] as const;

export default defineTool({
  name: "translate",
  title: "Translate (Pulaar / French / English / Arabic)",
  description:
    "Translate a short text between Pulaar (Fulfulde/Pular), French, English, and Arabic. Returns the translation only.",
  inputSchema: {
    text: z.string().min(1).max(2000).describe("Text to translate."),
    from: z.enum(LANGS).describe("Source language."),
    to: z.enum(LANGS).describe("Target language."),
    dialect: z
      .enum(["fouta_toro", "fouta_djallon", "macina", "adamawa"])
      .optional()
      .describe("Optional Pulaar dialect to prefer when source or target is Pulaar."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ text, from, to, dialect }) => {
    if (from === to) return textResult(text);
    try {
      const dialectNote = dialect
        ? `When Pulaar is involved, prefer the ${dialect} variant (orthography ɓ ɗ ƴ ŋ).`
        : "For Pulaar, use standard orthography with ɓ ɗ ƴ ŋ.";
      const out = await callAI([
        {
          role: "system",
          content: `You are FulanIA, an expert translator for Pulaar (Fulfulde/Pular), French, English, and Arabic. ${dialectNote} Return ONLY the translation — no quotes, no notes, no romanization.`,
        },
        { role: "user", content: `Translate from ${from} to ${to}:\n\n${text}` },
      ]);
      return textResult(out);
    } catch (e) {
      return errorResult(e instanceof Error ? e.message : "Translation failed");
    }
  },
});
