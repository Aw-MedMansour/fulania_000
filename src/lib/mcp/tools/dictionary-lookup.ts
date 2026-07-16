import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { callAI, textResult, errorResult } from "../ai";

export default defineTool({
  name: "dictionary_lookup",
  title: "Pulaar dictionary lookup",
  description:
    "Look up a Pulaar word (or a word in French/English/Arabic) and return its meaning, part of speech, example sentence, and pronunciation notes.",
  inputSchema: {
    word: z.string().min(1).max(80).describe("Word or short phrase to look up."),
    source_language: z
      .enum(["pulaar", "french", "english", "arabic"])
      .default("pulaar")
      .describe("Language the input word is written in."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ word, source_language }) => {
    try {
      const out = await callAI([
        {
          role: "system",
          content: `You are FulanIA's Pulaar (Fulfulde/Pular) lexicographer. For the given word, return a compact Markdown card with:
- **Pulaar** (standard orthography ɓ ɗ ƴ ŋ)
- **Français**, **English**, **العربية**
- **Part of speech / classe nominale** if applicable
- **Prononciation** between /slashes/
- **Example** — one Pulaar sentence with its French translation
- **Dialect notes** — only if the word differs notably across Fuuta Tooro / Fuuta Jaloo / Maasina / Aadamaawa.
Keep it under 12 lines. If you are not confident the word exists, say so plainly.`,
        },
        { role: "user", content: `Input (${source_language}): ${word}` },
      ]);
      return textResult(out);
    } catch (e) {
      return errorResult(e instanceof Error ? e.message : "Lookup failed");
    }
  },
});
